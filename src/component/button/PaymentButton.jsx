import React from 'react';
import api from "../../config/axios";

function PaymentButton() {
    const handlePayment = async () => {
        try {
            const response = await api.post('Payments/createVnpPayment', {
                amount: 100000,
                orderInfo: 'Thanh toán đơn hàng',
                returnUrl: 'http://localhost:5173/payment-result',
            });

            if (response.data && response.data.paymentUrl) {
                window.location.href = response.data.paymentUrl;
            } else {
                alert('Không thể tạo URL thanh toán');
            }
        } catch (error) {
            console.error('Error creating payment URL:', error);
        }
    };
    return (
        <div>
            <button
             onClick={handlePayment}
             className="rounded-full py-4 px-6 bg-gray-600 text-white font-semibold text-lg w-full text-center transition-all duration-500 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed mt-5"
             >Thanh toán với VnPay</button>
        </div>
    );
}
export default PaymentButton;