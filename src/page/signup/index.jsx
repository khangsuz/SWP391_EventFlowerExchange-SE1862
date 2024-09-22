import { Button, Form, Input } from "antd";
import React, { useState } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  // vùng của javascript
  const handleSignUp = async (values) => {
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
      alert(err.response.data);
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
              onFinish={handleSignUp}
            >
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Sign Up</h2>
              <div className="flex justify-center space-x-4 mb-6">
              </div>
              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điẹn thoại!",
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
              <Form.Item className="block text-gray-700 text-sm font-bold mb-2"
                label="Confirm Password"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Mật khẩu không khớp!",
                  },
                ]}
              >
                <Input type="password" placeholder="Password" />
                
              </Form.Item>
              <Form.Item>
                <Button className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2" type="primary" htmlType="submit">
                  Register
                </Button>
              </Form.Item>
              <p className="mt-4 text-center text-sm text-gray-600">
                    Already have an account? <Link to={"/login"} className="text-blue-500 hover:text-blue-600 font-semibold">Sign In</Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;
