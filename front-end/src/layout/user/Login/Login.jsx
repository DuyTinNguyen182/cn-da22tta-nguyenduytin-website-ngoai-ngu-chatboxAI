import React, { useState } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Button, Checkbox, Form, Input, message, Spin } from "antd";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import apiClient from "../../../api/axiosConfig";
import { GoogleLogin } from "@react-oauth/google";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const stateData = location.state;

  const [messageApi, contextHolder] = message.useMessage();
  const [spinning, setSpinning] = useState(false);

  const { dispatch } = useAuth();

  const successMessage = () => {
    messageApi.open({
      key: "login",
      type: "success",
      content: "Đăng nhập thành công",
    });
  };

  const errorMessage = () => {
    messageApi.open({
      key: "login",
      type: "error",
      content: "Tên đăng nhập hoặc mật khẩu không chính xác",
    });
  };

  const onFinish = async (values) => {
    setSpinning(true);
    try {
      await apiClient.post(`/auth/login`, {
        username: values.username,
        password: values.password,
      });

      const userInfoRes = await apiClient.get("/user/info");

      dispatch({ type: "AUTH_SUCCESS", payload: userInfoRes.data });

      successMessage();

      setTimeout(() => {
        if (stateData?.action === "redirect") {
          navigate(stateData.url);
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      errorMessage();
    } finally {
      setSpinning(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setSpinning(true);
    try {
      const res = await apiClient.post("/auth/google-login", {
        credential: credentialResponse.credential,
      });
      const userInfoRes = await apiClient.get("/user/info");
      dispatch({ type: "AUTH_SUCCESS", payload: userInfoRes.data });

      successMessage();

      setTimeout(() => {
        if (stateData?.action === "redirect") {
          navigate(stateData.url);
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error) {
      console.error("Lỗi đăng nhập Google:", error);
      errorMessage();
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#d5e5ff]">
      {contextHolder}
      <Spin spinning={spinning} fullscreen />

      <div className="w-[400px] bg-white p-8 rounded-2xl shadow-xl border border-blue-100">
        <Form
          name="reflow_login"
          className="login-form"
          initialValues={{
            remember: true,
          }}
          onFinish={onFinish}
          layout="vertical"
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold text-blue-900 uppercase tracking-wide">
              Đăng nhập
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Chào mừng bạn quay trở lại!
            </p>
          </div>

          <Form.Item
            name="username"
            rules={[
              {
                required: true,
                message: "Vui lòng nhập tên đăng nhập!",
              },
            ]}
            initialValue={stateData?.username}
          >
            <Input
              prefix={<UserOutlined className="text-gray-400 text-lg mr-2" />}
              placeholder="Tên đăng nhập"
              size="large"
              allowClear
              className="py-2.5 rounded-lg"
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
            initialValue={stateData?.password}
          >
            <Input.Password
              prefix={<LockOutlined className="text-gray-400 text-lg mr-2" />}
              type="password"
              placeholder="Mật khẩu"
              size="large"
              allowClear
              className="py-2.5 rounded-lg"
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-600">Ghi nhớ đăng nhập</Checkbox>
              </Form.Item>

              <Link
                className="text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                to="/forgot-password"
              >
                Quên mật khẩu?
              </Link>
            </div>
          </Form.Item>

          <Form.Item className="mb-4">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full h-11 bg-blue-600 hover:!bg-blue-700 font-bold text-lg rounded-xl shadow-md shadow-blue-200 transition-all"
              size="large"
            >
              Đăng nhập
            </Button>
          </Form.Item>
          <div className="my-4 flex flex-col items-center">
            <div className="relative w-full text-center border-b border-gray-200 mb-4 leading-[0.1em]">
              <span className="bg-white px-2 text-gray-400 text-xs">HOẶC</span>
            </div>

            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                console.log("Login Failed");
                errorMessage();
              }}
              useOneTap
              shape="pill"
              text="signin_with"
              width="340"
            />
          </div>

          <div className="text-center text-gray-500">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="text-blue-600 font-bold hover:underline"
            >
              Đăng ký ngay!
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
}

export default Login;
