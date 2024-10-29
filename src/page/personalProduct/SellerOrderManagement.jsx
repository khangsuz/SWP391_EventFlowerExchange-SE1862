import React, { useState, useEffect } from 'react';
import { Table, Select, message } from 'antd';
import { useParams } from 'react-router-dom';
import api from "../../config/axios";

const { Option } = Select;


function SellerOrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { userId } = useParams(); 
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(4);

    useEffect(() => {
        fetchSellerOrders();
    }, [userId]);

    const fetchSellerOrders = async () => {
        try {
            const response = await api.get(`Orders/seller-orders/${userId}`);
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching seller orders:', error);
            message.error('Không thể tải danh sách đơn hàng');
            setLoading(false);
        }
    };

    const handleDeliveryStatusChange = async (orderId, newStatus) => {
        try {
            await api.put(`Orders/${orderId}/delivery`, { orderDelivery: newStatus, userId });
            message.success('Cập nhật trạng thái giao hàng thành công');
            fetchSellerOrders();
        } catch (error) {
            console.error('Error updating order delivery status:', error);
            message.error('Không thể cập nhật trạng thái giao hàng: ' + (error.response?.data || error.message));
        }
    };
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="container mx-auto px-4 py-8">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-4">#</th>
                        <th className="border p-2">Mã đơn hàng</th>
                        <th className="border p-2">Thông tin người nhận</th>
                        <th className="border p-2">Sản phẩm</th>
                        <th className="border p-2">Tổng tiền</th>
                        <th className="border p-2">Trạng thái</th>
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
                            </td>
                            <td className="border p-2">
                                <ul>
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map(item => (
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
                                <Select
                                    defaultValue={order.orderDelivery}
                                    style={{ width: 150 }}
                                    onChange={(value) => handleDeliveryStatusChange(order.orderId, value)}
                                >
                                    <Option value="ChờXửLý">Chờ xử lý</Option>
                                    <Option value="ĐangXửLý">Đang xử lý</Option>
                                    <Option value="ĐãGửiHàng">Đã gửi hàng</Option>
                                    <Option value="ĐãGiaoHàng">Đã giao hàng</Option>
                                    <Option value="ĐãHủy">Đã hủy</Option>
                                </Select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-center mt-4">
                {Array.from({ length: Math.ceil(orders.length / ordersPerPage) }, (_, i) => (
                    <button
                        key={i + 1}
                        onClick={() => paginate(i + 1)}
                        className={`px-3 py-1 mx-1 rounded ${currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                    >
                        {i + 1}
                    </button>
                ))}
                </div>
        </div>
    );
}

export default SellerOrderManagement;