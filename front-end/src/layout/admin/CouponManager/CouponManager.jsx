import { useEffect, useState } from "react";
import {
  Button,
  Table,
  Flex,
  Breadcrumb,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Select,
  Tag,
  InputNumber,
  DatePicker,
  Result,
  Switch,
} from "antd";
import { Link } from "react-router-dom";
import { PlusOutlined, EditOutlined, TagsOutlined } from "@ant-design/icons";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import moment from "moment";

const { RangePicker } = DatePicker;

function CouponManager() {
  const [open, setOpen] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [coupons, setCoupons] = useState([]);
  const [filteredCoupons, setFilteredCoupons] = useState([]);

  const [spinning, setSpinning] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();
  const { state } = useAuth();
  const { currentUser } = state;

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const getStatusTag = (coupon) => {
    const now = moment();
    const start = moment(coupon.start_date);
    const end = moment(coupon.expiration_date);

    if (!coupon.isActive) return <Tag color="default">Đã khóa</Tag>;
    if (now.isBefore(start)) return <Tag color="blue">Chưa diễn ra</Tag>;
    if (now.isAfter(end)) return <Tag color="red">Hết hạn</Tag>;
    if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit)
      return <Tag color="volcano">Hết lượt</Tag>;

    return <Tag color="green">Đang hoạt động</Tag>;
  };

  const columns = [
    {
      title: "Mã Code",
      dataIndex: "code",
      width: 150,
      render: (text) => <b style={{ color: "#1677ff" }}>{text}</b>,
    },
    {
      title: "Giảm giá",
      render: (_, record) => (
        <span>
          {record.discount_type === "percent"
            ? `${record.discount_value}% (Tối đa: ${
                record.max_discount_amount?.toLocaleString() || "∞"
              })`
            : `${record.discount_value?.toLocaleString()} VNĐ`}
        </span>
      ),
    },
    {
      title: "Đơn tối thiểu",
      dataIndex: "min_order_value",
      render: (val) => (val ? `${val.toLocaleString()} VNĐ` : "0 VNĐ"),
    },
    {
      title: "Lượt dùng",
      render: (_, record) => (
        <span>
          {record.usage_count} / {record.usage_limit || "∞"}
        </span>
      ),
    },
    {
      title: "Thời gian",
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>{moment(record.start_date).format("DD/MM/YYYY")}</div>
          <div style={{ color: "#888" }}>
            đến {moment(record.expiration_date).format("DD/MM/YYYY")}
          </div>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      align: "center",
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Sửa",
      dataIndex: "_id",
      render: (id) => (
        <Link to={`update/${id}`}>
          <Button type="text" icon={<EditOutlined />} />
        </Link>
      ),
      width: 60,
      align: "center",
    },
  ];

  const fetchData = async () => {
    setSpinning(true);
    try {
      // Giả sử API endpoint là /coupon
      // Bạn cần tạo route GET /api/coupon trả về danh sách coupon
      const res = await apiClient.get("/coupon");
      const couponsWithKey = res.data.map((c) => ({ ...c, key: c._id }));
      setCoupons(couponsWithKey);
      setFilteredCoupons(couponsWithKey);
    } catch (error) {
      // Tạm thời comment để không báo lỗi nếu chưa có API
      // errorMessage("Không thể tải danh sách mã giảm giá");
      console.log(error);
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async () => {
    setSpinning(true);
    try {
      // Giả sử API delete multiple
      await apiClient.delete("/coupon/multiple", {
        data: { couponIds: selectedRowKeys },
      });
      successMessage(`Đã xóa ${selectedRowKeys.length} mã giảm giá`);
      setSelectedRowKeys([]);
      await fetchData();
    } catch (err) {
      errorMessage("Lỗi khi xoá mã giảm giá!");
    } finally {
      setOpenDeleteConfirm(false);
      setSpinning(false);
    }
  };

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      // Format dữ liệu trước khi gửi
      const payload = {
        ...values,
        start_date: values.dateRange[0].toDate(),
        expiration_date: values.dateRange[1].toDate(),
      };
      delete payload.dateRange;

      await apiClient.post(`/coupon`, payload);
      successMessage("Tạo mã giảm giá thành công!");
      setOpen(false);
      form.resetFields();
      await fetchData();
    } catch (err) {
      errorMessage(err.response?.data?.message || "Tạo mã thất bại!");
    } finally {
      setSpinning(false);
    }
  };

  const handleSearch = (value) => {
    const keyword = value?.toString().trim().toUpperCase();
    if (!keyword) {
      setFilteredCoupons(coupons);
      return;
    }
    const filtered = coupons.filter((c) => c.code.includes(keyword));
    setFilteredCoupons(filtered);
  };

  if (!currentUser || currentUser.role !== "Admin") {
    return (
      <Result
        status="403"
        title="403 - Forbidden"
        subTitle="Bạn không có quyền truy cập trang này."
        extra={
          <Link to="/">
            <Button type="primary">Về trang chủ</Button>
          </Link>
        }
      />
    );
  }

  return (
    <Flex className="CouponManager" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[{ title: "Admin Dashboard" }, { title: "Quản lý mã giảm giá" }]}
      />
      <Flex gap={12}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setOpen(true)}
        >
          Tạo mã mới
        </Button>
        <Input.Search
          placeholder="Tìm theo mã code..."
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
          allowClear
          enterButton
        />
      </Flex>

      {selectedRowKeys.length > 0 && (
        <Flex
          align="center"
          justify="space-between"
          style={{
            padding: "10px 15px",
            borderRadius: "5px",
            backgroundColor: "white",
            boxShadow: "0 0 15px rgba(0, 0, 0, 0.15)",
            position: "sticky",
            top: "10px",
            zIndex: 10,
          }}
        >
          <span>Đã chọn {selectedRowKeys.length} mã</span>
          <Button
            type="primary"
            danger
            onClick={() => setOpenDeleteConfirm(true)}
          >
            Xoá mục đã chọn
          </Button>
        </Flex>
      )}

      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: (keys) => setSelectedRowKeys(keys),
        }}
        columns={columns}
        dataSource={filteredCoupons}
        bordered
        scroll={{ x: 1000 }}
      />

      <Modal
        open={openDeleteConfirm}
        title="Xác nhận xoá"
        onOk={handleDelete}
        onCancel={() => setOpenDeleteConfirm(false)}
        okText="Xoá"
        okType="danger"
        cancelText="Hủy"
      >
        <p>Bạn có chắc muốn xóa các mã giảm giá đã chọn không?</p>
      </Modal>

      <Modal
        open={open}
        title="Tạo mã giảm giá mới"
        onCancel={() => setOpen(false)}
        footer={null}
        centered
        width={600}
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
                placeholder="VD: SUMMER2024"
                style={{ textTransform: "uppercase" }}
              />
            </Form.Item>
            <Form.Item
              name="discount_type"
              label="Loại giảm giá"
              initialValue="percent"
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
                        placeholder="Để trống nếu không giới hạn"
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
                defaultValue={0}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value?.replace(/\$\s?|(,*)/g, "")}
              />
            </Form.Item>
            <Form.Item
              name="usage_limit"
              label="Giới hạn lượt dùng"
              style={{ flex: 1 }}
            >
              <InputNumber
                style={{ width: "100%" }}
                min={1}
                placeholder="Không giới hạn"
              />
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
            <Input.TextArea rows={2} />
          </Form.Item>

          <Form.Item
            name="isActive"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Hoạt động" unCheckedChildren="Khóa" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: "100%" }}>
              Tạo mã
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </Flex>
  );
}

export default CouponManager;
