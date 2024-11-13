import { Button, Form, Input, Alert, Modal, message } from "antd";
import React, { useState, useEffect } from 'react';
import "../../index.css";
import Header from "../../component/header";
import api from "../../config/axios";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../../component/footer";

const SignUp = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [registrationData, setRegistrationData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    let timer;
    if (isVerifying && countdown > 0) {
      timer = setInterval(() => {
        setCountdown(c => c - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isVerifying, countdown]);

  const handleSignUp = async (values) => {
    setIsLoading(true);

    try {
      const response = await api.post("Users/register", {
        name: values.name,
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone
      });

      if (response.data.requireVerification) {
        setRegistrationData(values);
        setIsVerifying(true);
        setCountdown(60);
        message.success("Mã xác thực đã được gửi đến email của bạn");
      }
    } catch (err) {
      console.error("Registration error:", err.response?.data);
      
      if (err.response?.data) {
        if (Array.isArray(err.response.data)) {
          message.error(err.response.data.map(error => error.description).join(", "));
        } else if (typeof err.response.data === 'string') {
          message.error(err.response.data);
        } else if (err.response.data.errors) {
          const errorMessages = [];
          Object.keys(err.response.data.errors).forEach(key => {
            const error = err.response.data.errors[key];
            if (Array.isArray(error)) {
              errorMessages.push(`${key}: ${error.join(', ')}`);
            } else {
              errorMessages.push(`${key}: ${error}`);
            }
          });
          message.error(errorMessages.join(", "));
        } else if (err.response.data.message) {
          message.error(err.response.data.message);
        } else {
          switch (err.response.status) {
            case 400:
              message.error("Dữ liệu không hợp lệ");
              break;
            case 409:
              message.error("Tài khoản hoặc email đã tồn tại");
              break;
            case 500:
              message.error("Lỗi hệ thống");
              break;
            default:
              message.error("Đã xảy ra lỗi trong quá trình đăng ký");
          }
        }
      } else {
        message.error("Không thể kết nối đến server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async () => {
    try {
      const response = await api.post("Users/verify-email", {
        email: registrationData.email,
        code: verificationCode,
        registrationData: {
          name: registrationData.name,
          email: registrationData.email,
          password: registrationData.password,
          fullName: registrationData.fullName,
          phone: registrationData.phone
        }
      });

      message.success("Đăng ký tài khoản thành công!");
      navigate("/login");
    } catch (err) {
      console.error("Verification error:", err);
      message.error(err.response?.data?.message || "Mã xác thực không đúng");
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

        <div className="signup__form">
          <div className="form-wrapper">
            <Form
              form={form}
              className="form"
              labelCol={{ span: 24 }}
              onFinish={handleSignUp}
            >
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
                  {
                    max: 20,
                    message: "Tài khoản không được vượt quá 20 kí tự!",
                  },
                  {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: "Tài không hợp lệ!",
                  },
                  {
                    pattern: /^(?![0-9])/,
                    message: "Tài khoản không được bắt đầu bằng số!",
                  },
                  {
                    whitespace: true,
                    message: "Tài khoản không được chứa khoảng trắng!",
                  }
                ]}
              >
                <Input type="text" placeholder="username" />
              </Form.Item>

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
                  {
                    pattern: /^(03|05|07|08|09)\d{8}$/,
                    message: "Số điện thoại chưa hợp lệ!",
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
                  loading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Đang xử lý...' : 'Đăng ký'}
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

      <Modal
        title="Xác thực email"
        open={isVerifying}
        onOk={handleVerification}
        onCancel={() => setIsVerifying(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Input
          placeholder="Nhập mã xác thực"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{ marginTop: 16 }}
        />
      </Modal>

      <Footer />
    </>
  );
};

export default SignUp;