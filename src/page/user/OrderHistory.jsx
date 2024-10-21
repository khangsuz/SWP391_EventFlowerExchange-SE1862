import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import Header from '../../component/header';
import Footer from '../../component/footer';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(4);

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    const getStatusText = (status) => {
        switch(Number(status)) {
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
                const completedOrders = response.data.filter(order => order.orderStatus === "Completed");
                setOrders(completedOrders);
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

    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-4">#</th>
                        <th className="border p-2">Mã đơn</th>
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
                                <span className={`px-2 py-1 rounded ${(order.orderDelivery)}`}>
                                    {getStatusText(order.orderDelivery)}
                                </span>
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

export default OrderHistory;