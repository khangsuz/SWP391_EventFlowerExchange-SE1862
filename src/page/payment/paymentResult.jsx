import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";

function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
        const vnp_TxnRef = queryParams.get('vnp_TxnRef');
    
        const updatePaymentStatus = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await api.get(`Payments/vnpay-callback`, {
                    params: { vnp_ResponseCode, vnp_TxnRef },
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Payment status updated successfully');
                
                if (response.data.status === 'success') {
                    setPaymentStatus('Giao dịch thành công!');
                    // Clear the cart here
                    localStorage.removeItem('cartItems');
                    // If you're using a state management library like Redux, dispatch an action to clear the cart
                    // For example: dispatch(clearCart());
                } else {
                    setPaymentStatus('Giao dịch không thành công. ' + response.data.message);
                }
            } catch (error) {
                console.error('Error updating payment status:', error.response?.data || error.message);
                setPaymentStatus('Có lỗi xảy ra khi cập nhật trạng thái thanh toán.');
            }
        };
    
        updatePaymentStatus();
    }, [location]);

    const handleContinueShopping = () => {
        navigate('/');
    };

    return (
        <>
            <Header />
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg mb-20 mt-20">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Kết quả thanh toán</h2>
                <p className={`text-2xl ${paymentStatus === 'Giao dịch thành công!' ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentStatus}
                </p>
                <button 
                    onClick={handleContinueShopping}
                    className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                    Tiếp tục mua sắm
                </button>
            </div>
            <Footer />
        </>
    );
}

export default PaymentResult;