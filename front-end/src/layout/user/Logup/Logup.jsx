import "./Logup.css";
import { LockOutlined, MailOutlined, SmileOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Checkbox, Form, Input, message, Spin } from 'antd';
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import apiClient from "../../../api/axiosConfig";

function Register() {
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();
    const [spinning, setSpinning] = useState(false);

    const successMessage = () => {
        messageApi.open({
            key: 'register',
            type: 'success',
            content: 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...',
        });
    };

    const errorMessage = (errorMsg = 'Tên đăng nhập hoặc email đã tồn tại') => {
        messageApi.open({
            key: 'register',
            type: 'error',
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
                password: values.password
            });

            successMessage();

            // Chuyển hướng sau khi thành công
            setTimeout(() => {
                const stateData = {
                    action: "register",
                    username: values.username,
                    password: values.password
                };
                navigate('/login', { state: stateData });
            }, 1500);

        } catch (error) {
            console.error('Lỗi khi đăng ký:', error);
            // Hiển thị thông báo lỗi từ server nếu có
            const serverMessage = error.response?.data?.message;
            errorMessage(serverMessage);
        } finally {
            // Dùng finally để đảm bảo spinner luôn tắt
            setTimeout(() => setSpinning(false), 1000);
        }
    };

    return (
        <div className="Logup">
            {contextHolder}
            <Spin spinning={spinning} fullscreen />
            <Form
                name="reflow_register"
                className="login-form"
                initialValues={{
                    remember: true,
                }}
                onFinish={onFinish}
                style={{ width: 350 }}
            >
                <Form.Item >
                    <h1 style={{ textAlign: "center", fontSize: "20px" }}>ĐĂNG KÝ</h1>
                </Form.Item>
                <Form.Item
                    name="name"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập họ và tên!',
                        },
                        {
                            validator: (_, value) => {
                                if (!value) return Promise.resolve();
                                if (/\d/.test(value)) {
                                    return Promise.reject("Họ và tên không được chứa ký tự số!");
                                }
                                if (/[^a-zA-ZÀ-Ỹà-ỹ\s]/.test(value)) {
                                    return Promise.reject("Họ và tên không được chứa ký tự đặc biệt!");
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                >
                    <Input prefix={<SmileOutlined className="site-form-item-icon" />} placeholder="Họ và tên" size="large" allowClear />
                </Form.Item>
                <Form.Item
                    name="email"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập email!',
                        },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" size="large" allowClear />
                </Form.Item>
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập tên đăng nhập!',
                        },
                    ]}
                >
                    <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" size="large" allowClear />
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Vui lòng nhập mật khẩu!',
                        },
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="site-form-item-icon" />}
                        type="password"
                        placeholder="Mật khẩu"
                        size="large"
                        allowClear
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Tôi đồng ý với các điều khoản và dịch vụ</Checkbox>
                    </Form.Item>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button" size="large" style={{ width: "100%" }}>
                        Đăng ký
                    </Button>
                </Form.Item>
                <Form.Item>
                    Đã có tài khoản? <Link to="/login">Đăng nhập!</Link>
                </Form.Item>
            </Form>
        </div>
    );
}

export default Register;