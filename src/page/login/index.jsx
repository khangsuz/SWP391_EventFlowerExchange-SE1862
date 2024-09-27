import { Button, Form, Input } from "antd";
import React from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google';
import { FaGoogle } from "react-icons/fa";
import Footer from "../../component/footer";

const Login = () => {
  const navigate = useNavigate();
  const handleLogin = async (values) => {
    console.log(values);
    try {
      const response = await api.post("Users/login", values);
      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (error) {
      alert("Sai tên đăng nhập hoặc mật khẩu");
    }
  };


  const loginGoogle = useGoogleLogin({
    onSuccess: async (response) => {
      console.log("Google login response:", response);
      const token = response.credential;
      try {
        const token = response.credential;
        const result = await api.post("/Users/google-login", {
          token: token,
        });
        console.log(result.data);
      } catch (error) {
        console.error("Đăng nhập thất bại:", error.response.data);
      }
    },
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
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
              <div className="flex justify-center space-x-4 mb-6">
                <button 
                  className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-110"
                  onClick={() => loginGoogle()} 
                >
                  <FaGoogle className="text-xl" />
                </button>
              </div>
              <div className="mb-6 text-center">
                <span className="px-2 bg-white text-sm text-gray-500">Or sign in with name</span>
              </div>
              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Username"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tài khoản!",
                  },
                ]}
              >
                <Input type="text" placeholder="..." />
              </Form.Item>
          
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Password"
                name="password"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              >
                <Input type="password" placeholder="Password" />
              </Form.Item>

              <Form.Item>
                <Button
                  className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                  type="primary"
                  htmlType="submit"
                >
                  Login
                </Button>
              </Form.Item>

              <p className="mt-4 text-center text-sm text-gray-600">
                Don't have an account? <Link to={"/signup"} className="text-blue-500 hover:text-blue-600 font-semibold">Signup</Link>
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