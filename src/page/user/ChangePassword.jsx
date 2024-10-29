import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/axios';
import { Form, Input, Button } from 'antd';
import { Notification, notifySuccess, notifyError } from '../../component/alert';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (values) => {
        if (values.newPassword.length < 5) {
            notifyError('Mật khẩu mới phải có ít nhất 5 ký tự');
            return;
        }

        if (values.newPassword !== values.confirmPassword) {
            notifyError('Mật khẩu mới và xác nhận mật khẩu không khớp');
            return;
        }
        
        setIsSubmitting(true);
        try {
            await api.post('/Users/change-password', {
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            });
            
            notifySuccess('Đổi mật khẩu thành công!');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            const errorMessage = err.response?.data || 'Có lỗi xảy ra khi đổi mật khẩu';
            notifyError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6">
            <Notification />
            <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
                Đổi Mật Khẩu
            </h2>
            
            <Form 
                onFinish={handleSubmit} 
                layout="vertical"
                className="space-y-4"
            >
                <Form.Item
                    name="currentPassword"
                    label="Mật khẩu hiện tại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }
                    ]}
                >
                    <Input.Password 
                        placeholder="Nhập mật khẩu hiện tại" 
                        className="rounded-md"
                    />
                </Form.Item>

                <Form.Item
                    name="newPassword"
                    label="Mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                        { min: 5, message: 'Mật khẩu mới phải có ít nhất 5 ký tự!' }
                    ]}
                >
                    <Input.Password 
                        placeholder="Nhập mật khẩu mới" 
                        className="rounded-md"
                    />
                </Form.Item>

                <Form.Item
                    name="confirmPassword"
                    label="Xác nhận mật khẩu mới"
                    rules={[
                        { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                            },
                        }),
                    ]}
                >
                    <Input.Password 
                        placeholder="Xác nhận mật khẩu mới" 
                        className="rounded-md"
                    />
                </Form.Item>

                <Form.Item className="mb-0">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        className="w-full bg-blue-500 hover:bg-blue-600 font-semibold h-10 rounded-md"
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Đang xử lý...' : 'Đổi mật khẩu'}
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChangePassword;
