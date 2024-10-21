import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, Checkbox, Modal } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

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
    const [isPolicyModalVisible, setIsPolicyModalVisible] = useState(false);
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

    const showPolicyModal = () => {
        setIsPolicyModalVisible(true);
    };

    const handlePolicyModalOk = () => {
        setIsPolicyModalVisible(false);
    };

    const handlePolicyModalCancel = () => {
        setIsPolicyModalVisible(false);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <Form form={form} onFinish={onFinish} layout="vertical" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                    name="userName"
                    label="Tên người dùng"
                    className="block text-gray-700 text-lg font-bold mb-2"
                >
                    <Input disabled className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </Form.Item>
                <Form.Item
                    name="storeName"
                    label="Tên cửa hàng"
                    rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng!' }]}
                    className="block text-gray-700 text-lg font-bold mb-2"
                >
                    <Input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </Form.Item>
                <Form.Item
                    name="email"
                    label="Email"
                    className="block text-gray-700 text-lg font-bold mb-2"
                >
                    <Input disabled className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </Form.Item>
                <Form.Item
                    name="address"
                    label="Địa chỉ"
                    rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                    className="block text-gray-700 text-lg font-bold mb-2"
                >
                    <Input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </Form.Item>
                <Form.Item
                    name="phone"
                    label="Số điện thoại"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số điện thoại!' },
                        { pattern: /^[0-9]{10}$/, message: 'Số điện thoại phải có 10 chữ số!' }
                    ]}
                    className="block text-gray-700 text-lg font-bold mb-2"
                >
                    <Input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </Form.Item>
                <Form.Item
                    name="idCard"
                    label="Số CMND/CCCD"
                    rules={[
                        { required: true, message: 'Vui lòng nhập số CMND/CCCD!' },
                        { pattern: /^[0-9]{9,12}$/, message: 'Số CMND/CCCD phải có 9 hoặc 12 chữ số!' }
                    ]}
                    className="block text-gray-700 text-lg font-bold mb-2"
                >
                    <Input className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                </Form.Item>
                <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                        {
                            validator: (_, value) =>
                                value ? Promise.resolve() : Promise.reject(new Error('Vui lòng đồng ý với các điều khoản và chính sách')),
                        },
                    ]}
                    className="col-span-2"
                >
                    <Checkbox>
                        Tôi đã đọc và đồng ý với <a onClick={(e) => { e.preventDefault(); showPolicyModal(); }}>các điều khoản và chính sách</a>
                    </Checkbox>
                </Form.Item>
                <Form.Item className="col-span-2">
                    <Button type="primary" htmlType="submit" loading={loading} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-md">
                        Gửi yêu cầu
                    </Button>
                </Form.Item>
            </Form>
            <p className="text-center text-gray-600">
                Sau khi gửi yêu cầu, chúng tôi sẽ xem xét và phê duyệt trong thời gian sớm nhất.
            </p>
            <Modal
                title="Điều khoản và Chính sách"
                visible={isPolicyModalVisible}
                onOk={handlePolicyModalOk}
                onCancel={handlePolicyModalCancel}
                footer={[
                    <Button key="submit" type="primary" onClick={handlePolicyModalOk}>
                        Đã hiểu
                    </Button>,
                ]}
            >
                <Typography>
                    <Title level={4}>Chính sách đăng ký người bán</Title>
                    <Paragraph>
                        1. Người bán phải là cá nhân hoặc tổ chức sở hữu các sản phẩm hoa còn tồn đọng sau sự kiện hoặc trong tình trạng cần thanh lý.
                    </Paragraph>
                    <Paragraph>
                        2. Người bán chịu trách nhiệm về chất lượng và tình trạng của sản phẩm hoa sau sự kiện, đồng thời cung cấp mô tả chính xác về sản phẩm trên nền tảng.
                    </Paragraph>
                    <Paragraph>
                        3. Người bán sẽ phải chịu một khoản phí dịch vụ hoặc hoa hồng cho mỗi giao dịch thành công trên nền tảng, tỷ lệ phần trăm sẽ được chia theo 70% cho người bán và 30% cho nền tảng.
                    </Paragraph>
                    <Paragraph>
                        4. Trong trường hợp có tranh chấp về chất lượng hoa, người bán có trách nhiệm giải quyết với khách hàng và đảm bảo hoàn tiền (nếu cần) theo quy định của nền tảng.
                    </Paragraph>
                    <Paragraph>
                        5. Người bán được quyền sử dụng các công cụ hỗ trợ từ nền tảng để quảng bá sản phẩm, quản lý đơn hàng và theo dõi giao dịch.
                    </Paragraph>
                </Typography>
            </Modal>
        </div>
    );
};

export default RegisterSeller;