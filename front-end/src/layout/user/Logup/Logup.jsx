import React, { useState } from "react";
import {
  LockOutlined,
  MailOutlined,
  SmileOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import apiClient from "../../../api/axiosConfig";

function Register() {
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();
  const [spinning, setSpinning] = useState(false);

  const successMessage = () => {
    messageApi.open({
      key: "register",
      type: "success",
      content: "Đăng ký thành công! Đang chuyển đến trang đăng nhập...",
    });
  };

  const errorMessage = (errorMsg = "Tên đăng nhập hoặc email đã tồn tại") => {
    messageApi.open({
      key: "register",
      type: "error",
      content: errorMsg,
    });
  };

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      await apiClient.post(`/auth/register`, {
        fullname: values.name,
        email: values.email,
        username: values.username,
        password: values.password,
      });

      successMessage();

      setTimeout(() => {
        const stateData = {
          action: "register",
          username: values.username,
          password: values.password,
        };
        navigate("/login", { state: stateData });
      }, 1500);
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      const serverMessage = error.response?.data?.message;
      errorMessage(serverMessage);
    } finally {
      setTimeout(() => setSpinning(false), 1000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#d5e5ff] p-4">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl border border-blue-50">
        <Form
          name="reflow_register"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-blue-900 uppercase tracking-wide">
              Đăng Ký
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Tạo tài khoản để bắt đầu
            </p>
          </div>

          <Form.Item
            name="name"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập họ và tên!",
              },
              {
                validator: (_, value) => {
                  if (!value) return Promise.resolve();
                  if (/\d/.test(value)) {
                    return Promise.reject(
                      "Họ và tên không được chứa ký tự số!"
                    );
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
              prefix={<SmileOutlined className="text-gray-400 mr-2" />}
              placeholder="Họ và tên"
              size="large"
              allowClear
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập email!",
              },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400 mr-2" />}
              placeholder="Email"
              size="large"
              allowClear
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đăng nhập!",
              },
            ]}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400 mr-2" />}
              placeholder="Tên đăng nhập"
              size="large"
              allowClear
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập mật khẩu!",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              type="password"
              placeholder="Mật khẩu"
              size="large"
              allowClear
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item className="mb-2">
            <Form.Item name="remember" valuePropName="checked" noStyle>
              <Checkbox className="text-gray-600 text-sm">
                Tôi đồng ý với các điều khoản và dịch vụ
              </Checkbox>
            </Form.Item>
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-11 bg-blue-600 hover:!bg-blue-700 font-bold text-lg rounded-xl shadow-md shadow-blue-200 transition-all"
              size="large"
            >
              Đăng ký
            </Button>
          </Form.Item>

          <div className="text-center text-gray-500">
            Đã có tài khoản?{" "}
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              Đăng nhập!
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Register;
