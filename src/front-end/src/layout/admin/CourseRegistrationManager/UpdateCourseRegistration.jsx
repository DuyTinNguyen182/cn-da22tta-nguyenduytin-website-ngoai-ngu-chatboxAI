import {
  Form,
  Select,
  Button,
  Breadcrumb,
  Flex,
  Spin,
  message,
  Input,
  Tag,
  Descriptions,
  Divider,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";
import {
  ShopOutlined,
  CreditCardOutlined,
  TagOutlined,
  DollarOutlined,
} from "@ant-design/icons";

function UpdateCourseRegistration() {
  const { registrationId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [courses, setCourses] = useState([]);
  const [sessions, setSessions] = useState([]);

  const [studentName, setStudentName] = useState("");
  const [initialData, setInitialData] = useState(null);

  const [messageApi, contextHolder] = message.useMessage();

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  useEffect(() => {
    if (!registrationId) {
      setLoading(false);
      errorMessage("Không tìm thấy ID đăng ký trong URL.");
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [courseListRes, sessionRes, regRes] = await Promise.all([
          apiClient.get("/course"),
          apiClient.get("/class-sessions"),
          apiClient.get(`/registration/${registrationId}`),
        ]);

        setCourses(courseListRes.data);
        setSessions(sessionRes.data);

        const reg = regRes.data;

        if (reg?.user_id && reg?.course_id) {
          setStudentName(reg.user_id.fullname);

          const originalPrice =
            reg.course_id.discounted_price || reg.course_id.Tuition;
          const finalPrice = reg.final_amount ?? originalPrice;

          setInitialData({
            userid: reg.user_id.userid,
            name: reg.user_id.fullname,
            course_id: reg.course_id._id,
            class_session_id: reg.class_session_id?._id || reg.class_session_id,
            payment_method: reg.payment_method || "vnpay",
            isPaid: reg.isPaid,
            coupon_code: reg.coupon_id?.code,
            discount_amount: reg.discount_amount || 0,
            original_price: originalPrice,
            final_price: finalPrice,
          });
        } else {
          errorMessage("Dữ liệu đăng ký trả về không hợp lệ");
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        errorMessage("Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [registrationId]);

  const onFinish = async (values) => {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/registration/${registrationId}`, {
        course_id: values.course_id,
        class_session_id: values.class_session_id,
      });
      successMessage("Cập nhật đăng ký thành công");
      setTimeout(() => navigate("/admin/registercourses"), 1000);
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
    <Flex className="UpdateCourseRegistration" vertical gap={20}>
      {contextHolder}
      <Spin spinning={isSubmitting} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/registercourses">Quản lý đăng ký</Link> },
          { title: `Cập nhật cho: ${studentName}` },
        ]}
      />

      {initialData ? (
        <div style={{ maxWidth: 700, margin: "0 auto", width: "100%" }}>
          <Descriptions
            title="Thông tin chi tiết đơn hàng"
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            size="small"
            style={{ marginBottom: 20, backgroundColor: "white" }}
          >
            <Descriptions.Item label="Trạng thái thanh toán">
              {initialData.isPaid ? (
                <Tag color="green">Đã thanh toán</Tag>
              ) : (
                <Tag color="red">Chưa thanh toán</Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức thanh toán">
              {initialData.payment_method === "cash" ? (
                <Tag color="orange" icon={<ShopOutlined />}>
                  Tiền mặt tại trung tâm
                </Tag>
              ) : (
                <Tag color="blue" icon={<CreditCardOutlined />}>
                  VNPay (Online)
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Giá gốc khóa học">
              {initialData.original_price?.toLocaleString()} đ
            </Descriptions.Item>
            <Descriptions.Item label="Mã giảm giá">
              {initialData.coupon_code ? (
                <Tag color="cyan" icon={<TagOutlined />}>
                  {initialData.coupon_code}
                </Tag>
              ) : (
                <span style={{ color: "#999" }}>Không sử dụng</span>
              )}
            </Descriptions.Item>

            {/* Hàng 3: Số tiền giảm & Thành tiền */}
            <Descriptions.Item label="Số tiền được giảm">
              <span style={{ color: "green" }}>
                -{initialData.discount_amount?.toLocaleString()} đ
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Thành tiền (Thực thu)">
              <span
                style={{ color: "#d4380d", fontWeight: "bold", fontSize: 15 }}
              >
                {initialData.final_price?.toLocaleString()} đ
              </span>
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="left">Thông tin khóa học & Lịch học</Divider>

          {/* FORM CẬP NHẬT */}
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialData}
            style={{
              backgroundColor: "white",
              padding: 24,
              borderRadius: 8,
              border: "1px solid #f0f0f0",
            }}
          >
            <Flex gap={16}>
              <Form.Item label="Mã học viên" name="userid" style={{ flex: 1 }}>
                <Input disabled />
              </Form.Item>
              <Form.Item label="Tên học viên" name="name" style={{ flex: 1 }}>
                <Input disabled />
              </Form.Item>
            </Flex>

            <Form.Item
              label="Thay đổi khóa học"
              name="course_id"
              rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
              help="Lưu ý: Thay đổi khóa học có thể làm sai lệch số tiền đã tính toán trước đó."
            >
              <Select
                showSearch
                placeholder="Chọn khóa học"
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={courses.map((course) => ({
                  value: course._id,
                  label: `${course.courseid} - ${
                    course.language_id?.language
                  } - ${
                    course.languagelevel_id?.language_level
                  } (${course.discounted_price?.toLocaleString()}đ)`,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="Thay đổi lịch học"
              name="class_session_id"
              rules={[{ required: true, message: "Vui lòng chọn lịch học" }]}
            >
              <Select
                placeholder="Chọn ca học / buổi học"
                options={sessions.map((s) => ({
                  value: s._id,
                  label: `${s.days} - ${s.time}`,
                }))}
              />
            </Form.Item>

            <Form.Item style={{ marginTop: 20 }}>
              <Button type="primary" htmlType="submit" block size="large">
                Lưu thay đổi
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <div>Không thể tải dữ liệu đăng ký để chỉnh sửa.</div>
      )}
    </Flex>
  );
}

export default UpdateCourseRegistration;
