import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Input, Button, Form, message } from "antd";
import { LockOutlined } from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();
  const navigate = useNavigate();

  const token = new URLSearchParams(location.search).get("token");

  useEffect(() => {
    if (!token) {
      messageApi.error("Link không hợp lệ hoặc đã hết hạn!");
    }
  }, [token, messageApi]);

  const onFinish = async (values) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiClient.post("/auth/reset-password", {
        token,
        password: values.password,
      });
      messageApi.success("Đổi mật khẩu thành công! Đang chuyển hướng...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      messageApi.error(err.response?.data?.message || "Có lỗi xảy ra!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#d5e5ff] p-4">
      {contextHolder}
      <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl border border-blue-50">
        <Form layout="vertical" onFinish={onFinish}>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-blue-900 uppercase tracking-wide">
              Đặt Lại Mật Khẩu
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Vui lòng nhập mật khẩu mới của bạn
            </p>
          </div>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu mới!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
            hasFeedback
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Nhập mật khẩu mới"
              size="large"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            dependencies={["password"]}
            hasFeedback
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Hai mật khẩu không khớp!"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 mr-2" />}
              placeholder="Xác nhận mật khẩu mới"
              size="large"
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-11 bg-blue-600 hover:!bg-blue-700 font-bold text-lg rounded-xl shadow-md shadow-blue-200 transition-all"
              disabled={!token}
            >
              Xác nhận đổi mật khẩu
            </Button>
          </Form.Item>

          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-blue-600 font-bold hover:underline"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default ResetPassword;
