import React, { useState } from "react";
import { Input, Button, Form, message, Spin } from "antd";
import { Link } from "react-router-dom";
import { MailOutlined } from "@ant-design/icons";
import apiClient from "../../../api/axiosConfig";

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await apiClient.post("/auth/forgot-password", { email: values.email });
      messageApi.success(
        "Vui lòng kiểm tra email để nhận link đặt lại mật khẩu!"
      );
      form.resetFields();
    } catch (err) {
      messageApi.error(
        err.response?.data?.message || "Có lỗi xảy ra, không thể gửi yêu cầu."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#d5e5ff] p-4">
      {contextHolder}
      <div className="w-full max-w-[400px] bg-white p-8 rounded-2xl shadow-xl border border-blue-50">
        <Form
          form={form}
          className="login-form"
          layout="vertical"
          onFinish={onFinish}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-blue-900 uppercase tracking-wide">
              Quên Mật Khẩu
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Nhập email để nhận liên kết khôi phục
            </p>
          </div>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không đúng định dạng!" },
            ]}
          >
            <Input
              prefix={<MailOutlined className="text-gray-400 mr-2" />}
              placeholder="Nhập email đã đăng ký"
              size="large"
              allowClear
              className="rounded-lg py-2"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-11 bg-blue-600 hover:!bg-blue-700 font-bold text-lg rounded-xl shadow-md shadow-blue-200 transition-all"
            >
              Gửi Link
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

export default ForgotPassword;
