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
                Sign Up
              </h2>

              {/* User Name Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Name"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your name!",
                  },
                  {
                    min: 4,
                    message: "Username must be at least 4 characters!",
                  },
                ]}
              >
                <Input type="text" placeholder="UserName" />
              </Form.Item>

              {/* Email Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please enter your email!",
                  },
                  {
                    type: "email",
                    message: "Invalid email address!",
                  },
                ]}
              >
                <Input type="text" placeholder="you@example.com" />
              </Form.Item>

              {/* Password Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter your password!",
                  },
                  {
                    min: 5,
                    message: "Password must be at least 5 characters!",
                  },
                ]}
              >
                <Input type="password" placeholder="Password" />
              </Form.Item>

              {/* Confirm Password Input */}
              <Form.Item
                className="block text-gray-700 text-sm font-bold mb-2"
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Please confirm your password!",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Passwords do not match!"));
                    },
                  }),
                ]}
              >
                <Input type="password" placeholder="Confirm Password" />
              </Form.Item>

              {/* Register Button */}
              <Form.Item>
                <Button
                  className="w-full bg-blue-500 text-white p-3 rounded-md font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out transform hover:scale-105 mt-2"
                  type="primary"
                  htmlType="submit"
                >
                  Register
                </Button>
              </Form.Item>

              {/* Link to Sign In page */}
              <p className="mt-4 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to={"/login"}
                  className="text-blue-500 hover:text-blue-600 font-semibold"
                >
                  Sign In
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
