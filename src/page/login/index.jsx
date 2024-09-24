import { Button, Form, Input } from "antd";
import React, { useState } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { useNavigate, Link } from "react-router-dom";
import { useGoogleLogin } from '@react-oauth/google'
import { FaGoogle } from "react-icons/fa";
import { jwtDecode } from "jwt-decode";

const Login = () => {
  const navigate = useNavigate();
  // vùng của javascript
  const handleLogin = async (values) => {
    console.log(values);
    try {
      // gửi request đến server
      const response = await api.post("login", values);
      const { token } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));
      navigate("/");
    } catch (err) {
      console.log(err);
      alert("Lỗi");
    }
  };

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const loginGoogle = useGoogleLogin({
    onSuccess: codeResponse => console.log(codeResponse),
    flow: 'auth-code',
  });

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (!validateEmail(e.target.value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (!validatePassword(e.target.value)) {
      setPasswordError('Password must be at least 8 characters long');
    } else {
      setPasswordError('');
    }
  };

  return (
    <>
      <Header />
      <div className="login">
        <div className="login__image">
          <img
            src="https://i.postimg.cc/90Bs6nLP/top-view-roses-flowers.jpg"
            alt=""
          />
        </div>
        <div className="login__form">
          <div className="form-wrapper">
            <Form
              className="form"
              labelCol={{
                span: 24,
              }}
              onFinish={handleLogin} // event => chạy khi mà form đc submit thành công
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
              <div className="flex justify-center space-x-4 mb-6">
                <button 
                className="p-2 rounded-full bg-red-500 text-white hover:bg-red-600 transition duration-300 ease-in-out transform hover:scale-110"
                onClick={loginGoogle}
                >
                  <FaGoogle className="text-xl" />
                </button>
              </div>
              <div className="mb-6 text-center">
                <span className="px-2 bg-white text-sm text-gray-500">Or sign in with email</span>
              </div>

              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                ]}
              >
                <Input type="text" placeholder="you@example.com" />
              </Form.Item>

              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu!",
                  },
                ]}
              >
                <Input type="password" placeholder="Password" />

              </Form.Item>
              <Form.Item>
                <Button className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2" type="primary" htmlType="submit">
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
    </>
  );
};

export default Login;
