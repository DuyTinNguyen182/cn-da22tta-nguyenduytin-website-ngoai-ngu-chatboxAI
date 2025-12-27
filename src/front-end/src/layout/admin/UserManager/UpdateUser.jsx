import { LockOutlined, MailOutlined, SmileOutlined, EnvironmentOutlined } from '@ant-design/icons';
import { Breadcrumb, Button, Flex, Form, Input, Select, Spin, message } from 'antd';
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';

function UpdateUser() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();
  const [spinning, setSpinning] = useState(true);
  //   const [userData, setUserData] = useState();
  const [form] = Form.useForm();

  const successMessage = (content) => messageApi.success(content);
  const errorMessage = (content) => messageApi.error(content);

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      const newUserData = {
        fullname: values.name,
        email: values.email,
        address: values.address,
        role: values.role,
        // Chỉ gửi password nếu người dùng có nhập vào
        ...(values.password && { password: values.password }),
      };

      await apiClient.put(`/user/${id}`, newUserData);
      successMessage("Cập nhật thành công");

      setTimeout(() => {
        navigate("/admin/users");
      }, 1000);
    } catch (error) {
      errorMessage(error.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setSpinning(false);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      setSpinning(true);
      try {
        const response = await apiClient.get(`/user/${id}`);
        const userData = response.data;
        // Điền dữ liệu vào form
        form.setFieldsValue({
          userid: userData.userid,
          name: userData.fullname,
          gender: userData.gender,
          email: userData.email,
          username: userData.username,
          address: userData.address,
          role: userData.role,
        });
      } catch (error) {
        errorMessage("Không thể tải dữ liệu người dùng");
      } finally {
        setSpinning(false);
      }
    };
    fetchUserData();
  }, [id, form]);

  return (
    <Flex className="UpdateUser" vertical gap={20}>
      {contextHolder}
      <Spin spinning={spinning} fullscreen />
      <Breadcrumb
        items={[
          { title: "Admin Dashboard" },
          { title: <Link to="/admin/users">Quản lý người dùng</Link> },
          { title: "Cập nhật" },
        ]}
      />

      <Form
        form={form} // Gắn form hook
        name="update_user_admin"
        layout="vertical"
        style={{ width: "400px", margin: "0 auto" }}
        onFinish={onFinish}
      >
        <Form.Item name="userid" label="ID">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="name"
          label="Họ và tên"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input
            prefix={<SmileOutlined />}
            placeholder="Họ và tên"
            size="large"
          />
        </Form.Item>
        <Form.Item name="gender" label="Giới tính">
          <Input disabled />
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
        <Form.Item name="username" label="Tên đăng nhập">
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="password"
          label="Mật khẩu mới (để trống nếu không đổi)"
          rules={[{ min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Nhập mật khẩu mới"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="address"
          label="Địa chỉ"
          rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
        >
          <Input
            prefix={<EnvironmentOutlined />}
            placeholder="Địa chỉ"
            size="large"
          />
        </Form.Item>
        <Form.Item
          name="role"
          label="Quyền tài khoản"
          rules={[{ required: true, message: "Vui lòng chọn quyền!" }]}
        >
          <Select placeholder="Loại tài khoản" size="large">
            <Select.Option value="Student">Student</Select.Option>
            <Select.Option value="Admin">Admin</Select.Option>
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

export default UpdateUser;
