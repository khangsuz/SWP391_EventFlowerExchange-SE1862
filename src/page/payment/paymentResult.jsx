import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../../component/header";
import Footer from "../../component/footer";
import api from "../../config/axios";
import { useCart } from "../../contexts/CartContext";
<<<<<<< HEAD
=======
import { Notification ,notifySuccess, notifyError } from "../../component/alert";
>>>>>>> w8

function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [paymentStatus, setPaymentStatus] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { updateCartItemCount } = useCart();
<<<<<<< HEAD
=======

    const createShippingOrder = async (orderDetails) => {
        if (!orderDetails || !orderDetails.orderId) {
            console.error('Order details are missing or invalid');
            notifyError('Không thể tạo đơn hàng giao hàng do thiếu thông tin đơn hàng.');
            return;
        }

        try {
            const shippingOrder = {
                from_name: 'Shop Hoa ABC',
                from_phone: '0901234567',
                from_address: '72 Lê Thánh Tôn, Phường Bến Ngh  ',
                from_ward_name: 'Phường Bến Nghé',
                from_district_name: 'Quận 1',
                from_province_name: 'TP Hồ Chí Minh',
                to_name: orderDetails.fullName,
                to_phone: orderDetails.phone,
                to_address: orderDetails.deliveryAddress,
                to_ward_name: orderDetails.wardName,
                to_ward_code: orderDetails.wardCode,
                to_district_id: parseInt(orderDetails.toDistrictId, 10),
                client_order_code: orderDetails.orderId.toString(),
                note: orderDetails.note || 'Không có ghi chú',
                weight: orderDetails.totalWeight,
                length: 30,
                width: 20,
                height: 10,
                required_note: "CHOXEMHANGKHONGTHU",
                items: (orderDetails.items || []).map(item => ({
                    name: item.flowerName,
                    code: item.flowerId.toString(),
                    quantity: item.quantity,
                    price: parseInt(item.price),
                    weight: 5000
                }))
            };

            console.log('Shipping order data:', JSON.stringify(shippingOrder, null, 2));

            const response = await api.post('Shipping/create-order', shippingOrder);
            console.log('GHN Shipping order created:', response.data);
            notifySuccess('Đơn hàng giao hàng đã được tạo thành công');
        } catch (error) {
            console.error('Error creating shipping order:', error.response?.data || error.message);
            notifyError('Không thể tạo đơn hàng giao hàng. Vui lòng liên hệ hỗ trợ.');
        }
    };
>>>>>>> w8

    useEffect(() => {
        const processPaymentResult = async () => {
            try {
                const queryParams = new URLSearchParams(location.search);
                const vnp_ResponseCode = queryParams.get('vnp_ResponseCode');
                
                const response = await api.get(`Payments/vnpay-return${location.search}`);
                console.log('Payment result processed:', response.data);

<<<<<<< HEAD
                switch(vnp_ResponseCode) {
                    case '00':
                        setPaymentStatus('Giao dịch thành công!');
                        localStorage.setItem('cart', JSON.stringify([]));
                        updateCartItemCount(0);
                        break;
                    case '07':
                        setPaymentStatus('Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).');
                        break;
                    case '09':
                        setPaymentStatus('Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng chưa đăng ký dịch vụ InternetBanking tại ngân hàng.');
                        break;
                    case '10':
                        setPaymentStatus('Giao dịch không thành công do: Tài khoản của khách hàng không đủ số dư để thực hiện giao dịch.');
                        break;
                    case '11':
                        setPaymentStatus('Giao dịch không thành công do: Đã hết hạn chờ thanh toán. Xin quý khách vui lòng thực hiện lại giao dịch.');
                        break;
                    case '12':
                        setPaymentStatus('Giao dịch không thành công do: Thẻ/Tài khoản của khách hàng bị khóa.');
                        break;
                    case '13':
                        setPaymentStatus('Giao dịch không thành công do Quý khách nhập sai mật khẩu xác thực giao dịch (OTP). Xin quý khách vui lòng thực hiện lại giao dịch.');
                        break;
                    case '24':
                        setPaymentStatus('Giao dịch không thành công do: Khách hàng hủy giao dịch');
                        break;
                    case '51':
                        setPaymentStatus('Giao dịch không thành công do: Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.');
                        break;
                    case '65':
                        setPaymentStatus('Giao dịch không thành công do: Tài khoản của Quý khách đã vượt quá hạn mức giao dịch trong ngày.');
                        break;
                    case '75':
                        setPaymentStatus('Ngân hàng thanh toán đang bảo trì.');
                        break;
                    case '79':
                        setPaymentStatus('Giao dịch không thành công do: KH nhập sai mật khẩu thanh toán quá số lần quy định. Xin quý khách vui lòng thực hiện lại giao dịch');
                        break;
                    case '99':
                        setPaymentStatus('Các lỗi khác (lỗi còn lại, không có trong danh sách mã lỗi đã liệt kê)');
                        break;
                    default:
                        setPaymentStatus('Giao dịch không thành công!');
                }
            } catch (error) {
                console.error('Error processing payment result:', error.response?.data || error.message);
                setPaymentStatus(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý kết quả thanh toán.');
=======
                if (vnp_ResponseCode === '00') {
                    setPaymentStatus('Giao dịch thành công!');
                    
                    // Get current cart and items being purchased
                    const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const purchasedItems = JSON.parse(localStorage.getItem('itemsBeingPurchased') || '{}');
                    
                    // Filter out only the purchased items
                    const updatedCart = currentCart.filter(item => 
                        item.sellerName !== purchasedItems.sellerName ||
                        !purchasedItems.itemIds.includes(item.flowerId)
                    );
                    
                    // Update cart with remaining items
                    localStorage.setItem('cart', JSON.stringify(updatedCart));
                    updateCartItemCount(updatedCart.length);
                    
                    // Clean up
                    localStorage.removeItem('itemsBeingPurchased');
                    localStorage.removeItem('pendingOrderId');
                }else {
                    setPaymentStatus('Thanh toán thất bại');
                    notifyError('Giao dịch không thành công hoặc đã bị hủy.');
                }
            } catch (error) {
                console.error('Error processing payment result:', error);
                setPaymentStatus('Có lỗi xảy ra khi xử lý kết quả thanh toán.');
                notifyError('Có lỗi xảy ra khi xử lý kết quả thanh toán.');
>>>>>>> w8
            } finally {
                setIsLoading(false);
            }
        };
    
        processPaymentResult();
    }, [location, updateCartItemCount]);

    const handleContinueShopping = () => {
        navigate('/');
    };

    return (
        <>
        <Notification />
            <Header />
            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-lg mb-20 mt-20">
                {isLoading ? (
                    <div className="text-center">
                        <div role="status">
                            <svg
                                aria-hidden="true"
                                className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                viewBox="0 0 100 101"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                />
                                <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                />
                            </svg>
                            <span className="sr-only">Loading...</span>
                        </div>
                        <p className="mt-5 text-xl">Đang xử lý kết quả thanh toán...</p>
                    </div>
                ) : (
                    <>
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
                    </>
                )}
            </div>
            <Footer />
        </>
    );
}

export default PaymentResult;
