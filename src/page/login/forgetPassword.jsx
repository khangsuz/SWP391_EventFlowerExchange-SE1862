import React from 'react';
import { Button, Form, Input, message } from "antd";
import { Link } from "react-router-dom";
import api from "../../config/axios";
import Header from "../../component/header";
import Footer from "../../component/footer";

const ForgotPassword = () => {
  const handleForgotPassword = async (values) => {
    try {
      const response = await api.post("Users/forgot-password", values);
      console.log("Forgot password response:", response.data);
      message.success("Vui lòng kiểm tra email của bạn để nhận mật khẩu mới.");
    } catch (error) {
      console.error("Forgot password error:", error);
      message.error("Có lỗi xảy ra. Vui lòng thử lại sau.");
    }
  };

  return (
    <>
      <Header />
      <div className="forgot-password min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Quên mật khẩu
            </h2>
          </div>
          <Form
            className="mt-8 space-y-6"
            onFinish={handleForgotPassword}
          >
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  message: "Vui lòng nhập email!",
                  type: "email"
                },
              ]}
            >
              <Input type="email" placeholder="Nhập email của bạn" className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm" />
            </Form.Item>

            <div>
              <Button
                type="primary"
                htmlType="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Gửi mật khẩu mới
              </Button>
            </div>
          </Form>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ForgotPassword;