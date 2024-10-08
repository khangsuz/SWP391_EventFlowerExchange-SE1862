import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../component/header';
import Footer from '../../component/footer';
import api from '../../config/axios';

function CheckoutPage() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        phone: '',
        email: '',
        city: '',
        district: '',
        address: '',
    });
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
        fetchUserInfo();
    }, []);

    const fetchUserInfo = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }

        try {
            const response = await api.get('Users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            setUserInfo(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
            alert('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo(prev => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            alert('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }
    
        setIsProcessing(true);
        try {
            // Thực hiện checkout
            const cartItemsToSend = cartItems.map(item => ({
                flowerId: item.flowerId,
                quantity: item.quantity
            }));
    
            const checkoutResponse = await api.post(
                'Orders/checkout', 
                cartItemsToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            console.log('Checkout successful:', checkoutResponse.data);
    
            // Tạo yêu cầu thanh toán VNPay
            const paymentResponse = await api.post(
                'Payments/createVnpPayment',
                { 
                    Amount: calculateTotal(),
                    ...userInfo
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
    
            // Lưu orderId vào localStorage để sử dụng sau khi thanh toán
            localStorage.setItem('pendingOrderId', checkoutResponse.data.orderId);
    
            // Chuyển hướng đến URL thanh toán VNPay
            window.location.href = paymentResponse.data.paymentUrl;
    
        } catch (error) {
            console.error('Payment error:', error);
            if (error.response) {
                alert(`Payment failed: ${error.response.data}`);
            } else if (error.request) {
                alert('Network error. Please check your connection and try again.');
            } else {
                alert('An unexpected error occurred. Please try again.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6 text-center">Thanh toán</h1>
                <div className="flex flex-wrap -mx-4">
                    <div className="w-full md:w-1/2 px-4 mb-4">
                        <h2 className="text-2xl font-bold mb-4">Thông tin thanh toán</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block mb-2">Họ và tên</label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={userInfo.fullName}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Số điện thoại</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={userInfo.phone}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={userInfo.email}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Tỉnh/Thành phố</label>
                                <input
                                    type="text"
                                    name="city"
                                    value={userInfo.city}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Quận/Huyện</label>
                                <input
                                    type="text"
                                    name="district"
                                    value={userInfo.district}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <label className="block mb-2">Địa chỉ</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={userInfo.address}
                                    onChange={handleInputChange}
                                    className="w-full p-2 border rounded"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isProcessing}
                                className="w-full bg-blue-500 text-white p-3 rounded-full hover:bg-blue-600 transition duration-300 mt-4"
                            >
                                {isProcessing ? 'Đang xử lý...' : 'Thanh toán qua VNPay'}
                            </button>
                        </form>
                    </div>
                    <div className="w-full md:w-1/2 px-4">
                        <h2 className="text-2xl font-bold mb-4">Đơn hàng của bạn</h2>
                        {cartItems.map((item) => (
                            <div key={item.flowerId} className="flex justify-between mb-2">
                                <span>{item.flowerName} x {item.quantity}</span>
                                <span>{(item.price * item.quantity).toLocaleString()}₫</span>
                            </div>
                        ))}
                        <div className="border-t pt-2 mt-2">
                            <div className="flex justify-between font-bold">
                                <span>Tổng cộng</span>
                                <span>{calculateTotal().toLocaleString()}₫</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CheckoutPage;