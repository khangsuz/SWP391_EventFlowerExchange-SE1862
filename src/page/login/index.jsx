import { Button, Form, Input } from "antd";
import React, { useEffect } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { useGoogleLogin } from "@react-oauth/google";
import Footer from "../../component/footer";
const Login = () => {
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    try {
      const response = await api.post("Users/login", values);
      console.log("Raw API response:", response);
      console.log("Login response data:", response.data);
      
      const { token = null, userType = null } = response.data;
      
      console.log("Extracted token:", token);
      console.log("Extracted userType:", userType);
      
      if (!token) {
        throw new Error("No token received from server");
      }
      
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify({ token, userType }));
      
      console.log("Stored user data:", JSON.parse(localStorage.getItem("user")));
       if (userType === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Sai tên đăng nhập hoặc mật khẩu");
    }
  };

  const loginGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log("Google login response:", tokenResponse);
      try {
        const result = await api.post("LoginGoogle/google-login", {
          accessToken: tokenResponse.access_token,
          idToken: tokenResponse.id_token
        });
        console.log(result.data);
        localStorage.setItem("token", result.data.token);
        localStorage.setItem("user", JSON.stringify(result.data.user));
        
        navigate("/");
      } catch (error) {
        console.error("Đăng nhập thất bại:", error.response?.data || error.message);
      }
    },
    flow: 'auth-code',
    scope: "email profile",
  });

  
  return (
    <>
      <Header />
      <div className="login">
        <div className="login__image mt-1 mb-1">
          <img
            src="https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"
            alt=""
          />
        </div>
        <div className="login__form">
          <div className="form-wrapper">
            <Form
              className="form"
              labelCol={{ span: 24 }}
              onFinish={handleLogin}
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Đăng nhập</h2>
              <div className="flex justify-center space-x-4 mb-6">
                <button 
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-110"
                  onClick={loginGoogle}
                  type="button"
                >
                  <FaGoogle className="text-xl" />
                </button>
              </div>
              <div className="mb-6 text-center">
                <span className="px-2 bg-white text-sm text-gray-500">Hoặc đăng nhập với tài khoản</span>
              </div>
              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Tài khoản"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tài khoản!",
                  },
                ]}
              >
                <Input type="text" placeholder="username" />
              </Form.Item>
          
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Mật khẩu"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input type="password" placeholder="password" />
              </Form.Item>

              <Form.Item>
                <Button
                  className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                  type="primary"
                  htmlType="submit"
                >
                  Đăng nhập
                </Button>
              </Form.Item>

              <p className="mt-4 text-center text-sm text-gray-600">
                Chưa có tài khoản? <Link to={"/signup"} className="text-blue-500 hover:text-blue-600 font-semibold">Đăng ký</Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;