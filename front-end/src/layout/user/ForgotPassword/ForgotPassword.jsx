import React, { useState } from 'react';
// import './ForgotPassword.css';
import { Input, Button, Form, message } from 'antd';
import { Link } from 'react-router-dom';
import apiClient from '../../../api/axiosConfig';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email: values.email });
      messageApi.success('Vui lòng kiểm tra email để nhận link đặt lại mật khẩu!');
      form.resetFields(); // Xóa email sau khi gửi thành công
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Có lỗi xảy ra, không thể gửi yêu cầu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login">
      {contextHolder}
      <Form
        form={form}
        className="login-form"
        style={{ width: 350 }}
        onFinish={onFinish}
      >
        <Form.Item>
          <h1 style={{ textAlign: 'center', fontSize: '20px' }}>QUÊN MẬT KHẨU</h1>
        </Form.Item>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không đúng định dạng!' }
          ]}
        >
          <Input
            type="email"
            placeholder="Nhập email đã đăng ký"
            size="large"
            allowClear
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="login-form-button" size="large" style={{ width: '100%' }}>
            Gửi Link
          </Button>
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
          <Link to="/login">Quay lại đăng nhập</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;