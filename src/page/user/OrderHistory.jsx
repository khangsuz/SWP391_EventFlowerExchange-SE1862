
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
    const [isCancelModalVisible, setIsCancelModalVisible] = useState(false);
    const [cancelForm] = Form.useForm();

    useEffect(() => {
        fetchOrderHistory();
    }, []);
    const deliveryStatuses = [
  { value: 0, label: "Chờ Xử Lý" },
  { value: 1, label: "Đã Gửi Hàng" },
  { value: 2, label: "Đã Giao Hàng" },
  { value: 3, label: "Đã Hủy" }
];

const getStatusText = (status) => {
  const deliveryStatus = deliveryStatuses.find(s => s.value === Number(status));
  return deliveryStatus ? deliveryStatus.label : "Không xác định";
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

    const handleCancelClick = (orderId) => {
        setSelectedOrderId(orderId);
        setIsCancelModalVisible(true);
    };

    const handleCancelModalSubmit = async (values) => {
        try {
            await api.post('/Orders/cancel-request', {
                orderId: selectedOrderId,
                fullName: values.fullName,
                phone: values.phone,
                reason: values.reason
            });

            message.success('Yêu cầu hủy đơn hàng đã được gửi!');
            setIsCancelModalVisible(false);
            cancelForm.resetFields();
            fetchOrderHistory();
        } catch (error) {
            message.error('Không thể gửi yêu cầu hủy đơn hàng: ' + error.response?.data?.message);
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
                    <Select.Option value="1">Đang giao hàng</Select.Option>
                    <Select.Option value="2">Đã giao hàng</Select.Option>
                    <Select.Option value="3">Đã hủy</Select.Option>
                </Select>
            </div>

            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2">Mã đơn</th>
                        <th className="border p-2">Thông tin người nhận</th>
                        <th className="border p-2">Thông tin người bán</th>
                        <th className="border p-2">Sản phẩm</th>
                        <th className="border p-2">Tổng tiền</th>
                        <th className="border p-2">Trạng thái</th>
                        <th className="border p-2">Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.map((order, index) => (
                        <tr key={order.orderId} className="border-b">
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
                                {order.orderItems && order.orderItems.length > 0 && order.orderItems[0].seller ? (
                                    <div>
                                        <div><strong>Người bán:</strong> {order.orderItems[0].seller.fullName}</div>
                                        <div><strong>SĐT:</strong> {order.orderItems[0].seller.phone}</div>
                                        <div><strong>Email:</strong> {order.orderItems[0].seller.email}</div>
                                        <div><strong>Địa chỉ shop:</strong> {order.orderItems[0].seller.address}</div>
                                    </div>
                                ) : (
                                    <div>Không có thông tin người bán</div>
                                )}
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
                                <span>{getStatusText(order.orderDelivery)}</span>
                            </td>
                            <td className="border p-2 text-center">
                                <div className="flex flex-col space-y-2">
                                    {order.orderDelivery === 3 ? (
                                        <Tooltip title="Nhấn để yêu cầu hỗ trợ">
                                            <Button
                                                type="link"
                                                onClick={() => handleReportClick(order.orderId)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Yêu cầu hỗ trợ
                                            </Button>
                                        </Tooltip>
                                    ) : order.orderDelivery === 4 ? (
                                        <span className="text-gray-500">Đơn hàng đã hủy</span>
                                    ) : (
                                        <Tooltip title="Nhấn để hủy đơn hàng">
                                            <Button
                                                type="link"
                                                danger
                                                onClick={() => handleCancelClick(order.orderId)}
                                                className="text-red-600 hover:text-red-800"
                                            >
                                                Hủy đơn hàng
                                            </Button>
                                        </Tooltip>
                                    )}
                                </div>
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
            <Modal
                title="Yêu cầu hủy đơn hàng"
                visible={isCancelModalVisible}
                onCancel={() => {
                    setIsCancelModalVisible(false);
                    cancelForm.resetFields();
                }}
                footer={null}
            >
                <Form form={cancelForm} onFinish={handleCancelModalSubmit} layout="vertical">
                    <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="Số điện thoại"
                        rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="reason"
                        label="Lý do hủy đơn"
                        rules={[{ required: true, message: 'Vui lòng nhập lý do hủy đơn!' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" danger htmlType="submit">
                            Gửi yêu cầu hủy
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default OrderHistory;
