import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import Header from '../../component/header';
import Footer from '../../component/footer';
import { Modal, Form, Input, Tooltip, Button, message, Select } from 'antd';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(4);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState(null);
    const [form] = Form.useForm();
    const [statusFilter, setStatusFilter] = useState('all');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const getStatusText = (status) => {
        switch (Number(status)) {
            case 0: return "Chờ xử lý";
            case 1: return "Đã xác nhận";
            case 2: return "Đang giao hàng";
            case 3: return "Đã giao hàng";
            case 4: return "Đã hủy";
            default: return "Không xác định";
        }
    };

    const fetchOrderHistory = async () => {
        try {
            const response = await api.get('Orders/history');
            if (Array.isArray(response.data)) {
                setOrders(response.data);
            } else {
                console.error('Data is not an array:', response.data);
                setError('Invalid data format received');
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching order history:', err);
            setError('Failed to fetch order history');
            setLoading(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (statusFilter === 'all') return true;
        return order.orderDelivery === Number(statusFilter);
    });

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleReportClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsModalVisible(true);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const onFinish = async (values) => {
        setSubmitting(true);
        try {
            await api.post('/Orders/reports', {
                orderId: selectedOrderId,
                content: values.reportContent
            });

            message.success('Báo cáo đã được gửi thành công!');
            handleModalCancel();
        } catch (error) {
            console.error('Error submitting report:', error);
            message.error(error.response?.data?.message || 'Không thể gửi báo cáo. Vui lòng thử lại sau.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto">
            <div className="mb-4">
                <Select
                    defaultValue="all"
                    className="w-1/5"
                    onChange={(value) => {
                        setStatusFilter(value);
                        setCurrentPage(1);
                    }}
                >
                    <Select.Option value="all">Tất cả trạng thái</Select.Option>
                    <Select.Option value="0">Chờ xử lý</Select.Option>
                    <Select.Option value="1">Đã xác nhận</Select.Option>
                    <Select.Option value="2">Đang giao hàng</Select.Option>
                    <Select.Option value="3">Đã giao hàng</Select.Option>
                    <Select.Option value="4">Đã hủy</Select.Option>
                </Select>
            </div>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-4">#</th>
                        <th className="border p-2">Mã đơn</th>
                        <th className="border p-2">Thông tin người nhận</th>
                        <th className="border p-2">Sản phẩm</th>
                        <th className="border p-2">Tổng tiền</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.map((order, index) => (
                        <tr key={order.orderId} className="border-b">
                            <td className="border p-2 text-center">{indexOfFirstOrder + index + 1}</td>
                            <td className="border p-2">
                                <div className="text-center text-lg">{order.orderId}</div>
                            </td>

                            <td className="border p-2">
                                <div><strong>Tên:</strong> {order.recipient?.fullName}</div>
                                <div><strong>SĐT:</strong> {order.recipient?.phone}</div>
                                <div><strong>Email:</strong> {order.recipient?.email}</div>
                                <div><strong>Địa chỉ:</strong> {order.recipient?.address}</div>
                                <div><strong>Ngày tạo:</strong> {new Date(order.orderDate).toLocaleDateString()}</div>
                                <div><strong>Ghi chú:</strong> {order.note}</div>
                            </td>
                            <td className="border p-2">
                                <ul>
                                    {order.orderItems && order.orderItems.length > 0 ? (
                                        order.orderItems.map(item => (
                                            <li key={item.flowerId}>
                                                <div>{item.flowerName} x {item.quantity}</div>
                                                <div className="font-medium">Giá: {item.price.toLocaleString()}đ</div>
                                            </li>
                                        ))
                                    ) : (
                                        <li>Không có sản phẩm nào.</li>
                                    )}
                                </ul>
                            </td>
                            <td className="border p-2 text-red-500 text-center">{order.totalAmount?.toLocaleString()}đ</td>
                            <td className="border p-2 text-center">
                                <span className={`${(order.orderDelivery)}`}>
                                    {getStatusText(order.orderDelivery)}
                                </span>
                            </td>
                            <td className="border p-2 text-center">
                                <Tooltip title={
                                    order.orderDelivery === 3
                                        ? 'Đơn hàng đã hoàn thành, không thể yêu cầu hỗ trợ'
                                        : 'Nhấn để yêu cầu hỗ trợ'
                                }>
                                    <Button
                                        type="link"
                                        onClick={() => handleReportClick(order.orderId)}
                                        disabled={order.orderDelivery === 3}
                                        className={
                                            order.orderDelivery === 3
                                                ? "text-gray-400 cursor-not-allowed"
                                                : "text-blue-600 hover:text-blue-800"
                                        }
                                    >
                                        Yêu cầu hỗ trợ
                                    </Button>
                                </Tooltip>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(filteredOrders.length / ordersPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        {i + 1}
                    </button>
                ))}
            </div>
            <Modal
                title="Báo cáo vấn đề đơn hàng"
                visible={isModalVisible}
                onCancel={handleModalCancel}
                footer={null}
            >
                <Form form={form} onFinish={onFinish} layout="vertical">
                    <Form.Item
                        name="reportContent"
                        label="Mô tả vấn đề của bạn"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung báo cáo!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={submitting}>
                            Gửi báo cáo
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default OrderHistory;
