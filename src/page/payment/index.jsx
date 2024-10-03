import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

function PaymentResult() {
    const location = useLocation();
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');

        if (vnp_ResponseCode === '00') {
            setPaymentStatus('Giao dịch thành công!');
        } else {
            setPaymentStatus('Giao dịch thất bại!');
        }
    }, [location]);

    return (
        <div>
            <h2>Kết quả thanh toán</h2>
            <p>{paymentStatus}</p>
        </div>
    );
}

export default PaymentResult;
