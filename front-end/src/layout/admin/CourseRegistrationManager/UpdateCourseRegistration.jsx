import {
  Form,
  Select,
  Button,
  Breadcrumb,
  Flex,
  Spin,
  message,
  Input,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";

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

        const registrationData = regRes.data;

        if (registrationData?.user_id && registrationData?.course_id) {
          setStudentName(registrationData.user_id.fullname);

          setInitialData({
            userid: registrationData.user_id.userid,
            name: registrationData.user_id.fullname,
            course_id: registrationData.course_id._id,
            class_session_id:
              registrationData.class_session_id?._id ||
              registrationData.class_session_id,
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
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialData}
          style={{ maxWidth: 500, margin: "0 auto", width: "100%" }}
        >
          <Form.Item label="Mã học viên" name="userid">
            <Input disabled />
          </Form.Item>
          <Form.Item label="Tên học viên" name="name">
            <Input disabled />
          </Form.Item>

          <Form.Item
            label="Thay đổi khóa học"
            name="course_id"
            rules={[{ required: true, message: "Vui lòng chọn khóa học" }]}
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
                label: `${course.courseid} - ${course.language_id?.language} - ${course.languagelevel_id?.language_level}`,
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

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div>Không thể tải dữ liệu đăng ký để chỉnh sửa.</div>
      )}
    </Flex>
  );
}

export default UpdateCourseRegistration;
