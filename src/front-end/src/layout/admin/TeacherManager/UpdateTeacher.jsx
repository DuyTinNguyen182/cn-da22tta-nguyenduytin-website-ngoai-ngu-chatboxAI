import { MailOutlined, SmileOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Flex,
  Form,
  Input,
  Select,
  Spin,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";

function UpdateTeacher() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [spinning, setSpinning] = useState(true);
  const [languageOptions, setLanguageOptions] = useState([]);
  const [teacherName, setTeacherName] = useState("");

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  useEffect(() => {
    const fetchData = async () => {
      setSpinning(true);
      try {
        const [teacherRes, languagesRes] = await Promise.all([
          apiClient.get(`/teacher/${id}`),
          apiClient.get(`/language`),
        ]);

        const teacherData = teacherRes.data;
        setLanguageOptions(languagesRes.data);
        setTeacherName(teacherData.full_name);

        form.setFieldsValue({
          teacherid: teacherData.teacherid,
          name: teacherData.full_name,
          email: teacherData.email,
          language_id: teacherData.language_id?._id,
        });
      } catch (error) {
        errorMessage("Không thể tải dữ liệu");
      } finally {
        setSpinning(false);
      }
    };

    fetchData();
  }, [id, form]);

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      const newTeacherData = {
        full_name: values.name,
        email: values.email,
        language_id: values.language_id,
      };
      await apiClient.put(`/teacher/${id}`, newTeacherData);
      successMessage("Cập nhật giảng viên thành công");
      setTimeout(() => navigate("/admin/teachers"), 1000);
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSpinning(false);
    }
  };

  return (
    <Flex className="UpdateTeacher" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/teachers">Quản lý giảng viên</Link> },
          { title: `Cập nhật: ${teacherName}` },
        ]}
      />

      <Form
        form={form}
        name="update_teacher"
        layout="vertical"
        style={{ width: 400, margin: "0 auto" }}
        onFinish={onFinish}
      >
        <Form.Item name="teacherid" label="Mã giảng viên">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[
            { required: true, message: "Vui lòng nhập họ và tên!" },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();

                if (/\d/.test(value)) {
                  return Promise.reject("Họ và tên không được chứa ký tự số!");
                }

                if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                  return Promise.reject(
                    "Họ và tên không được chứa ký tự đặc biệt!"
                  );
                }

                return Promise.resolve();
              },
            },
          ]}
        >
          <Input
            prefix={<SmileOutlined />}
            placeholder="Họ và tên"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
        </Form.Item>
        <Form.Item
          name="language_id"
          label="Ngôn ngữ giảng dạy"
          rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ!" }]}
        >
          <Select placeholder="Chọn ngôn ngữ" size="large">
            {languageOptions.map((lang) => (
              <Select.Option key={lang._id} value={lang._id}>
                {lang.language}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item style={{ paddingTop: 20 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            style={{ width: "100%" }}
          >
            Lưu thay đổi
          </Button>
        </Form.Item>
      </Form>
    </Flex>
  );
}

export default UpdateTeacher;
