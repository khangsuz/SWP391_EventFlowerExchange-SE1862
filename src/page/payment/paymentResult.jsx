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
        const processPaymentResult = async () => {
            try {
                const response = await api.get(`Payments/vnpay-return${location.search}`);
                console.log('Payment result processed:', response.data);
                
                if (response.data.status === 'success') {
                    setPaymentStatus('Giao dịch thành công!');
                    localStorage.removeItem('cart');
                } else {
                    setPaymentStatus(response.data.message || 'Giao dịch không thành công. Vui lòng thử lại sau.');
                }
            } catch (error) {
                console.error('Error processing payment result:', error.response?.data || error.message);
                setPaymentStatus(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán.');
            }
        };
    
        processPaymentResult();
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