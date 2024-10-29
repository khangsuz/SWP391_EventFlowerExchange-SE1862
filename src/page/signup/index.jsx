import { Button, Form, Input, message, Alert } from "antd";
import React, { useState } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/footer";



const SignUp = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [error, setError] = useState(null);

  const handleSignUp = async (values) => {
    console.log("Form values:", values);
<<<<<<< HEAD
  
    try {
      const response = await api.post("Users/register", values);
      const { token } = response.data;
  
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(response.data));
  
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          const errorMessages = err.response.data.errors.map(error => 
            `${error.field}: ${error.errors.join(', ')}`
          ).join('\n');
          alert(`Validation errors:\n${errorMessages}`);
        } else {
          alert(err.response.data.message || "An error occurred during registration.");
=======
    setError(null);

    try {
      const response = await api.post("Users/register", values);
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      console.error("Registration error:", err.response?.data);
      if (err.response && err.response.data) {
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.errors) {
          const errorFields = err.response.data.errors.map(error => ({
            name: error.field,
            errors: error.errors,
          }));
          form.setFields(errorFields);
          setError("Please correct the errors in the form.");
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else {
          setError("An error occurred during registration.");
>>>>>>> w8
        }
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  return (
    <>
      <Header />
      <div className="login">
        <div className="login__image mt-1 mb-1">
          <img
            src="https://i.postimg.cc/Jz0MW07g/top-view-roses-flowers-Photoroom.png"
            alt="loginImage"
          />
        </div>

        <div className="login__form">
          <div className="form-wrapper">
            {error && (
              <Alert
                message="Registration Error"
                description={error}
                type="error"
                showIcon
                closable
                onClose={() => setError(null)}
                style={{ marginBottom: 16 }}
              />
            )}
            <Form
              form={form}
              className="form"
              labelCol={{
                span: 24,
              }}
              onFinish={handleSignUp}
            >
<<<<<<< HEAD
              {/* Sign-up title */}
=======
>>>>>>> w8
              <h2 className="text-3xl font-bold mb-6 mt-6 text-center text-gray-800">
                Đăng ký
              </h2>

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

<<<<<<< HEAD
              {/* Full Name Input */}
=======
>>>>>>> w8
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Họ và tên"
                name="fullName"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập họ và tên!",
                  },
                ]}
              >
                <Input type="text" placeholder="Nguyễn Văn A" />
              </Form.Item>

<<<<<<< HEAD
              {/* Email Input */}
=======
>>>>>>> w8
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
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Điện thoại"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                ]}
              >
                <Input type="text" placeholder="0123456789" />
              </Form.Item>

              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Điện thoại"
                name="phone"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng nhập số điện thoại!",
                  },
                  {
                    pattern: /^\d{10}$/,
                    message: "Số điện thoại phải có 10 chữ số!",
                  },
                ]}
              >
                <Input type="text" placeholder="0123456789" />
              </Form.Item>

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
              <Form.Item>
                <Button
                  className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                  type="primary"
                  htmlType="submit"
                >
                  Đăng ký
                </Button>
              </Form.Item>
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