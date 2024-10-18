// import React, { useState, useEffect } from 'react';
// import api from "../../config/axios";

// function OrderHistory() {
//     const [orders, setOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         fetchOrderHistory();
//     }, []);

//     const fetchOrderHistory = async () => {
//         try {
//             const response = await api.get('Orders/history');
//             const data = response.data;
            
//             // Kiểm tra nếu dữ liệu có cấu trúc { $id, $values }
//             const ordersArray = Array.isArray(data) ? data : (data.$values || []);
            
//             setOrders(ordersArray);
//             setLoading(false);
//         } catch (err) {
//             console.error('Error fetching order history:', err);
//             setError('Failed to fetch order history');
//             setLoading(false);
//         }
//     };

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>{error}</div>;

//     return (
//         <div className="container mx-auto px-4 py-8">
//             <h1 className="text-2xl font-bold mb-4">Order History</h1>
//             {orders.length === 0 ? (
//                 <p>You haven't placed any orders yet.</p>
//             ) : (
//                 <div className="space-y-4">
//                     {orders.map((order) => (
//                         <div key={order.orderId} className="border rounded-lg p-4 shadow-sm">
//                             <div className="flex justify-between items-center mb-2">
//                                 <h2 className="text-lg font-semibold">Order #{order.orderId}</h2>
//                                 <span className="text-sm text-gray-500">
//                                     {new Date(order.orderDate).toLocaleString()}
//                                 </span>
//                             </div>
//                             <p className="text-sm mb-2">Status: {order.orderStatus}</p>
//                             <p className="text-sm mb-2">Total: ${order.totalAmount?.toFixed(2)}</p>
//                             <h3 className="font-semibold mt-2 mb-1">Items:</h3>
//                             <ul className="list-disc list-inside">
//                                 {order.orderItems?.map((item) => (
//                                     <li key={item.orderItemId} className="text-sm">
//                                         {item.flowerName} - Quantity: {item.quantity}, Price: ${item.price?.toFixed(2)}
//                                     </li>
//                                 ))}
//                             </ul>
//                         </div>
//                     ))}
//                 </div>
//             )}
//         </div>
//     );
// }

// export default OrderHistory;



import React, { useState, useEffect } from 'react';
import api from "../../config/axios";
import Header from '../../component/header';
import Footer from '../../component/footer';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-4">Lịch sử đơn hàng</h1>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2">#</th>
                            <th className="border p-2">Mã đơn hàng</th>
                            <th className="border p-2">Thông tin người nhận</th>
                            <th className="border p-2">Phương thức</th>
                            <th className="border p-2">COD</th>
                            <th className="border p-2">Trọng lượng</th>
                            <th className="border p-2">Phí vận chuyển</th>
                            <th className="border p-2">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order, index) => (
                            <tr key={order.orderId} className="border-b">
                                <td className="border p-2">{index + 1}</td>
                                <td className="border p-2">
                                    <div>{order.orderId}</div>
                                    <div className="text-sm text-gray-500">{order.orderStatus}</div>
                                </td>
                                <td className="border p-2">
                                    <div>{order.user?.fullName}</div>
                                    <div className="text-sm text-gray-500">{order.user?.phone}</div>
                                    <div className="text-sm text-gray-500">Ngày tạo: {new Date(order.orderDate).toLocaleDateString()}</div>
                                </td>
                                <td className="border p-2">COD</td>
                                <td className="border p-2 text-red-500">{order.totalAmount?.toLocaleString()} đ</td>
                                <td className="border p-2">{order.orderItems?.reduce((total, item) => total + item.quantity * 1200, 0)} g</td>
                                <td className="border p-2">
                                    <div>Bên nhận trả phí</div>
                                    <div>Tổng thu: {order.totalAmount?.toLocaleString()} vnđ</div>
                                    <div className="text-sm text-gray-500">(Bao gồm COD)</div>
                                </td>
                                <td className="border p-2">
                                    <button className="bg-blue-500 text-white px-2 py-1 rounded mr-2 mb-1">Chỉnh sửa</button>
                                    <button className="bg-green-500 text-white px-2 py-1 rounded mr-2 mb-1">Tra cứu</button>
                                    <button className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 mb-1">Trợ giúp</button>
                                    <button className="bg-purple-500 text-white px-2 py-1 rounded">In vận đơn</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Footer />
        </>
    );
}

export default OrderHistory;