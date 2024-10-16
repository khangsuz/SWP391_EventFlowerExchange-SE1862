import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import Header from '../../component/header';
import Footer from '../../component/footer';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [ordersPerPage] = useState(5); // Number of orders per page

    useEffect(() => {
        fetchOrderHistory();
    }, []);

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

    // Calculate the orders to display on the current page
    const indexOfLastOrder = currentPage * ordersPerPage;
    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
    const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

    // Change page
    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-4">#</th>
                        <th className="border p-2">Mã đơn hàng</th>
                        <th className="border p-2">Thông tin người nhận</th>
                        <th className="border p-2">Phương thức</th>
                        <th className="border p-4">Tổng tiền</th>
                        <th className="border p-2">Phí vận chuyển</th>
                        <th className="border p-2">Thao tác</th>
                    </tr>
                </thead>
                <tbody>
                    {currentOrders.map((order, index) => (
                        <tr key={order.orderId} className="border-b">
                            <td className="border p-2 text-center">{indexOfFirstOrder + index + 1}</td>
                            <td className="border p-2">
                                <div>{order.orderId}</div>
                                <div className="text-sm text-gray-500">{order.orderStatus}</div>
                            </td>
                            <td className="border p-2">
                                <div>{order.recipient?.fullName}</div>
                                <div className="text-sm text-gray-500">{order.recipient?.phone}</div>
                                <div className="text-sm text-gray-500">{order.recipient?.email}</div>
                                <div className="text-sm text-gray-500">{order.recipient?.address}</div>
                                <div className="text-sm text-gray-500">Ngày tạo: {new Date(order.orderDate).toLocaleDateString()}</div>
                            </td>
                            <td className="border p-2">VnPay</td>
                            <td className="border p-2 text-red-500">{order.totalAmount?.toLocaleString()}đ</td>
                            <td className="border p-2">
                                <div>Bên nhận trả phí</div>
                                <div>Tổng thu: {order.totalAmount?.toLocaleString()} vnđ</div>
                                <div className="text-sm text-gray-500">(Bao gồm COD)</div>
                            </td>
                            <td className="border p-">
                                <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-1">Chỉnh sửa</button>
                                <button className="bg-green-500 text-white px-2 py-1 rounded mr-2 mb-1">Tra cứu</button>
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
