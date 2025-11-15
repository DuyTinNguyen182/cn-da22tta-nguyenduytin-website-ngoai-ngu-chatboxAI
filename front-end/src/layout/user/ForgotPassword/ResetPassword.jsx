import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Input, Button, Form, message } from 'antd';
// import './ResetPassword.css';
import apiClient from '../../../api/axiosConfig';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const location = useLocation();
  const navigate = useNavigate();

  // Lấy token từ query string
  const token = new URLSearchParams(location.search).get('token');

  useEffect(() => {
    if (!token) {
        messageApi.error('Link không hợp lệ hoặc đã hết hạn!');
    }
  }, [token, messageApi]);

  const onFinish = async (values) => {
    if (!token) return;
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { 
        token, 
        password: values.password 
      });
      messageApi.success('Đổi mật khẩu thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      messageApi.error(err.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="Login">
      {contextHolder}
      <Form
        className="login-form"
        style={{ width: 350 }}
        onFinish={onFinish}
      >
        <Form.Item>
          <h1 style={{ textAlign: 'center', fontSize: '20px' }}>ĐẶT LẠI MẬT KHẨU</h1>
        </Form.Item>
        <Form.Item
          name="password"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
          hasFeedback // Thêm icon check khi valid
        >
          <Input.Password
            placeholder="Nhập mật khẩu mới"
            size="large"
            allowClear
          />
        </Form.Item>
        <Form.Item
            name="confirm"
            dependencies={['password']}
            hasFeedback
            rules={[
                { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                ({ getFieldValue }) => ({
                    validator(_, value) {
                        if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                        }
                        return Promise.reject(new Error('Hai mật khẩu không khớp!'));
                    },
                }),
            ]}
        >
            <Input.Password placeholder="Xác nhận mật khẩu mới" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading} className="login-form-button" size="large" style={{ width: '100%' }} disabled={!token}>
            Xác nhận đổi mật khẩu
          </Button>
        </Form.Item>
        <Form.Item style={{ textAlign: 'center' }}>
          <Link to="/login">Quay lại đăng nhập</Link>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPassword;