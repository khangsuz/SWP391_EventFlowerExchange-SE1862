import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { Form, Input, Button, Alert } from 'antd';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (values) => {
        setError(null);
        setSuccess(null);

        if (values.newPassword.length < 5) {
            setError('Mật khẩu mới phải có ít nhất 5 ký tự.');
            return;
        }

        if (values.newPassword !== values.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }

        try {
            const response = await api.post('/Users/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            });
            setSuccess('Đổi mật khẩu thành công!');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Có lỗi xảy ra khi đổi mật khẩu.');
        }
    };

    return (
        <>
            <div className="max-w-xl mx-auto p-6 rounded-lg">
                {error && (
                    <Alert message={error} type="error" showIcon className="mb-4" />
                )}
                {success && (
                    <Alert message={success} type="success" showIcon className="mb-4" />
                )}
                <Form onFinish={handleSubmit} layout="vertical">
                    <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                        className="block text-gray-700 text-lg font-bold mb-2"
                    >
                        <Input.Password placeholder="Nhập mật khẩu hiện tại" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </Form.Item>
                    <Form.Item
                        name="newPassword"
                        label="Mật khẩu mới"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 5, message: 'Mật khẩu mới phải có ít nhất 5 ký tự!' }]}
                        className="block text-gray-700 text-lg font-bold mb-2"
                    >
                        <Input.Password placeholder="Nhập mật khẩu mới" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </Form.Item>
                    <Form.Item
                        name="confirmPassword"
                        label="Xác nhận mật khẩu mới"
                        rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới!' }]}
                        className="block text-gray-700 text-lg font-bold mb-2"
                    >
                        <Input.Password placeholder="Xác nhận mật khẩu mới" className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full mt-2 font-bold">
                            Đổi mật khẩu
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </>
    );
};

export default ChangePassword;
