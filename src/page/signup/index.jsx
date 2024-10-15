import { Button, Form, Input } from "antd";
import React from 'react';
import "../../index.css"; 
import Header from "../../component/header"; 
import api from "../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/footer";

const SignUp = () => {
  const navigate = useNavigate();

  const handleSignUp = async (values) => {
    console.log(values);

    try {
      const response = await api.post("Users/register", values);
      const { token } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));

      navigate("/");
    } catch (err) {
      console.log(err);
      if (err.response && err.response.data) {
        alert(err.response.data);
        navigate("/login")
      } else {
        alert("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="login">
        {/* Sign-up page image */}
        <div className="login__image mt-1 mb-1">
          <img
            src="https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"
            alt="loginImage"
          />
        </div>

        {/* Sign-up form */}
        <div className="login__form">
          <div className="form-wrapper">
            <Form
              className="form"
              labelCol={{
                span: 24,
              }}
              onFinish={handleSignUp}
            >
              {/* Sign-up title */}
              <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
                Đăng ký
              </h2>

              {/* User Name Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Tài khoản"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập tài khoản!",
                  },
                  {
                    min: 4,
                    message: "Tài khoản phải ít nhất 4 kí tự!",
                  },
                ]}
              >
                <Input type="text" placeholder="username" />
              </Form.Item>

              {/* Email Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập email!",
                  },
                  {
                    type: "email",
                    message: "Email không hợp lệ!",
                  },
                ]}
              >
                <Input type="text" placeholder="you@example.com" />
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Mật khẩu"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập mật khẩu!",
                  },
                  {
                    min: 5,
                    message: "Mật khẩu phải ít nhất 5 kí tự",
                  },
                ]}
              >
                <Input type="password" placeholder="password" />
              </Form.Item>

              {/* Confirm Password Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Xác nhận mật khẩu"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Mật khẩu không khớp",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu không khớp!"));
                    },
                  }),
                ]}
              >
                <Input type="password" placeholder="..." />
              </Form.Item>

              {/* Register Button */}
              <Form.Item>
                <Button
                  className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                  type="primary"
                  htmlType="submit"
                >
                  Đăng ký
                </Button>
              </Form.Item>

              {/* Link to Sign In page */}
              <p className="mt-4 text-center text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  to={"/login"}
                  className="text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Đăng nhập
                </Link>
              </p>
            </Form>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SignUp;
