import {
  Form,
  Button,
  Breadcrumb,
  Flex,
  Spin,
  message,
  Input,
  Select,
  InputNumber,
  DatePicker,
  Switch,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

const { RangePicker } = DatePicker;

function UpdateCoupon() {
  const { id } = useParams(); // Lấy ID coupon từ URL
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState("");

  const [messageApi, contextHolder] = message.useMessage();

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const fetchCoupon = async () => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/coupon/${id}`);
        const data = res.data;

        setCouponCode(data.code);

        // Format lại dữ liệu cho form
        form.setFieldsValue({
          ...data,
          dateRange: [moment(data.start_date), moment(data.expiration_date)],
        });
      } catch (err) {
        console.error("Lỗi:", err);
        errorMessage("Không thể tải thông tin mã giảm giá.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoupon();
  }, [id, form]);

  const onFinish = async (values) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...values,
        start_date: values.dateRange[0].toDate(),
        expiration_date: values.dateRange[1].toDate(),
      };
      delete payload.dateRange;

      await apiClient.put(`/coupon/${id}`, payload);
      successMessage("Cập nhật thành công");
      setTimeout(() => navigate("/admin/coupons"), 1000);
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Spin fullscreen tip="Đang tải dữ liệu..." />;
  }

  return (
    <Flex className="UpdateCoupon" vertical gap={20}>
      {contextHolder}
      <Spin spinning={isSubmitting} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/coupons">Quản lý mã giảm giá</Link> },
          { title: `Cập nhật: ${couponCode}` },
        ]}
      />

      <div
        style={{
          backgroundColor: "white",
          padding: 24,
          borderRadius: 8,
          maxWidth: 800,
          margin: "0 auto",
          width: "100%",
        }}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Flex gap={16}>
            <Form.Item
              name="code"
              label="Mã Code"
              rules={[{ required: true, message: "Nhập mã code!" }]}
              style={{ flex: 1 }}
            >
              <Input
                disabled
                style={{ textTransform: "uppercase", color: "#000" }}
              />
            </Form.Item>
            <Form.Item
              name="discount_type"
              label="Loại giảm giá"
              style={{ width: 150 }}
            >
              <Select
                options={[
                  { value: "percent", label: "Theo %" },
                  { value: "fixed", label: "Số tiền" },
                ]}
              />
            </Form.Item>
          </Flex>

          <Form.Item
            noStyle
            shouldUpdate={(prev, current) =>
              prev.discount_type !== current.discount_type
            }
          >
            {({ getFieldValue }) => {
              const type = getFieldValue("discount_type");
              return (
                <Flex gap={16}>
                  <Form.Item
                    name="discount_value"
                    label={
                      type === "percent"
                        ? "Phần trăm giảm (%)"
                        : "Số tiền giảm (VNĐ)"
                    }
                    rules={[{ required: true, message: "Nhập giá trị!" }]}
                    style={{ flex: 1 }}
                  >
                    <InputNumber
                      style={{ width: "100%" }}
                      min={0}
                      max={type === "percent" ? 100 : undefined}
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>

                  {type === "percent" && (
                    <Form.Item
                      name="max_discount_amount"
                      label="Giảm tối đa (VNĐ)"
                      style={{ flex: 1 }}
                    >
                      <InputNumber
                        style={{ width: "100%" }}
                        min={0}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                        parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
                      />
                    </Form.Item>
                  )}
                </Flex>
              );
            }}
          </Form.Item>

          <Flex gap={16}>
            <Form.Item
              name="min_order_value"
              label="Đơn tối thiểu (VNĐ)"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item
              name="usage_limit"
              label="Giới hạn tổng lượt dùng"
              style={{ flex: 1 }}
              help="Để trống nếu không giới hạn"
            >
              <InputNumber style={{ width: "100%" }} min={1} />
            </Form.Item>
          </Flex>

          <Form.Item
            name="dateRange"
            label="Thời gian áp dụng"
            rules={[{ required: true, message: "Chọn thời gian!" }]}
          >
            <RangePicker
              showTime
              format="DD/MM/YYYY HH:mm"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item name="isActive" valuePropName="checked" label="Trạng thái">
            <Switch
              checkedChildren="Đang hoạt động"
              unCheckedChildren="Đang khóa"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      </div>
    </Flex>
  );
}

export default UpdateCoupon;
