import React, { useEffect, useState } from 'react';
import Header from "../../component/header";
import Footer from "../../component/footer";
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

function PaymentResult() {
    const location = useLocation();
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');

        if (vnp_ResponseCode === '00') {
            setPaymentStatus('Giao dịch thành công!');
        } else  if (vnp_ResponseCode === '07'){
            setPaymentStatus('Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).');
        } else  if (vnp_ResponseCode === '09') {
            setPaymentStatus('Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng..');
        } else  if (vnp_ResponseCode === '10') {
            setPaymentStatus('Giao dịch không thành công do: Tài khoản của khách hàng không đủ số dư để thực hiện giao dịch.');
        } else  if (vnp_ResponseCode === '11') {
            setPaymentStatus('Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.');
        } else  if (vnp_ResponseCode === '12') {
            setPaymentStatus('Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.');
        } else  if (vnp_ResponseCode === '13') {
            setPaymentStatus('Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.');
        } else if (vnp_ResponseCode === '24') {
            setPaymentStatus('Giao dịch không thành công do: Khách hàng hủy giao dịch');
        }  else if (vnp_ResponseCode === '51') {
            setPaymentStatus('Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.');
        } else if (vnp_ResponseCode === '65') {
            setPaymentStatus('Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.');
        } else if (vnp_ResponseCode === '75') {
            setPaymentStatus('Ngân hàng thanh toán đang bảo trì.');
        } else if (vnp_ResponseCode === '79') {
            setPaymentStatus('Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch');
        } else if (vnp_ResponseCode === '99') {
            setPaymentStatus('Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)');
        } else {
            setPaymentStatus('Giao dịch không thành công!');
        }
    }, [location]);

    return (
        <>
            <Header />
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg mb-20 mt-20">
                <h2 className="text-4xl font-bold text-gray-800 mb-4">Kết quả thanh toán</h2>
                <p className={`text-2xl ${paymentStatus === 'Giao dịch thành công!' ? 'text-green-600' : 'text-red-600'}`}>
                    {paymentStatus}
                </p>
                <Link to="/" className="text-3xl mt-6 text-blue-500 hover:text-blue-700">Tiếp tục mua sắm</Link>
            </div>
            <Footer />
        </>
    );
}

export default PaymentResult;