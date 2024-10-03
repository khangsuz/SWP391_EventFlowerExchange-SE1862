import React from 'react';
import api from "../../config/axios";

function PaymentButton() {
    const handlePayment = async () => {
        try {
            // Gửi yêu cầu tạo URL thanh toán đến API backend
            const response = await api.post('Payments/createVnpPayment', {
                amount: 100000, // số tiền thanh toán, đơn vị VND
                orderInfo: 'Thanh toán đơn hàng',
                returnUrl: 'http://localhost:5173/payment-result', // URL callback sau khi thanh toán thành công
            });

            if (response.data && response.data.paymentUrl) {
                // Chuyển hướng đến trang thanh toán VnPay
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
            <button onClick={handlePayment}>Thanh toán với VnPay</button>
        </div>
    );
}

export default PaymentButton;