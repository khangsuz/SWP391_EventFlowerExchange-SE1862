import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const API_URL = 'https://localhost:7288/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    }
});

const RegisterSeller = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    message.error('Vui lòng đăng nhập để tiếp tục.');
                    navigate('/login');
                    return;
                }

                const response = await api.get('/Users/current-user', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.status === 200) {
                    setUserData(response.data);
                    form.setFieldsValue({
                        email: response.data.email,
                        userName: response.data.name,
                        phone: response.data.phone,
                        address: response.data.address
                    });
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
                if (error.response && error.response.status === 401) {
                    message.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                    navigate('/login');
                } else {
                    message.error('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
                }
            }
        };
        fetchUserData();
    }, [form, navigate]);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('No token found');
            }
            const formattedValues = {
                storeName: values.storeName,
                address: values.address,
                phone: values.phone,
                idCard: values.idCard
            };
            const response = await api.post('/SellerRegistration', formattedValues, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 201) {
                message.success('Yêu cầu đăng ký đã được gửi đi. Vui lòng chờ admin phê duyệt.');
                form.resetFields();
            } else {
                throw new Error('Unexpected response status');
            }
        } catch (error) {
            console.error('Error submitting seller registration:', error);
            if (error.response && error.response.data) {
                if (typeof error.response.data === 'string') {
                    message.error(error.response.data);
                } else if (error.response.data.errors) {
                    const errorMessages = Object.values(error.response.data.errors).flat();
                    message.error(errorMessages.join(', '));
                } else {
                    message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
                }
            } else {
                message.error('Có lỗi xảy ra. Vui lòng thử lại sau.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <h1 className="text-center text-2xl mb-6 font-semibold">Đăng ký làm người bán</h1>
            <Form form={form} onFinish={onFinish} layout="vertical" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                    name="userName"
                    label="Tên người dùng"
                    className="col-span-1"
                >
                    <Input disabled className="border-gray-300 rounded-md" />
                </Form.Item>
                <Form.Item
                    name="storeName"
                    label="Tên cửa hàng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
                    className="col-span-1"
                >
                    <Input className="border-gray-300 rounded-md" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    className="col-span-1"
                >
                    <Input disabled className="border-gray-300 rounded-md" />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    className="col-span-1"
                >
                    <Input className="border-gray-300 rounded-md" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
                    ]}
                    className="col-span-1"
                >
                    <Input className="border-gray-300 rounded-md" />
                </Form.Item>
                <Form.Item
                    name="idCard"
                    label="Số CMND/CCCD"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số CMND/CCCD!' },
                        { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD phải có 9 hoặc 12 chữ số!' }
                    ]}
                    className="col-span-1"
                >
                    <Input className="border-gray-300 rounded-md" />
                </Form.Item>
                <Form.Item className="col-span-2">
                    <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md">
                        Gửi yêu cầu
                    </Button>
                </Form.Item>
            </Form>
            <p className="text-center text-gray-600 mt-4">
                Sau khi gửi yêu cầu, chúng tôi sẽ xem xét và phê duyệt trong thời gian sớm nhất.
            </p>
        </div>
    );
};

export default RegisterSeller;