import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../config/axios";
import Header from "../../component/header";
import Footer from "../../component/footer";

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const { updateCartItemCount } = useCart();

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
    }, []);

    const updateQuantity = (flowerId, newQuantity) => {
        const parsedQuantity = parseInt(newQuantity, 10);
        if (isNaN(parsedQuantity) || parsedQuantity < 1) return;
        const updatedCart = cartItems.map(item =>
            item.flowerId === flowerId ? { ...item, quantity: parsedQuantity } : item
        );
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        updateCartItemCount();
    };

    const removeFromCart = (flowerId) => {
        const updatedCart = cartItems.filter(item => item.flowerId !== flowerId);
        setCartItems(updatedCart);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        updateCartItemCount();
    };

    const clearCart = () => {
        setCartItems([]);
        localStorage.setItem('cart', JSON.stringify([]));
        updateCartItemCount();
    };

    const calculateSubtotal = () => {
        return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handleCheckoutAndPayment = async () => {
        const token = localStorage.getItem('token');

        if (!token) {
            alert('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }

        if (cartItems.length === 0) {
            alert('Giỏ hàng của bạn đang trống');
            return;
        }

        setIsCheckingOut(true);
        try {
            // Bước 1: Tạo đơn hàng
            const checkoutResponse = await api.post(
                'Orders/checkout',
                cartItems.map(item => ({
                    flowerId: item.flowerId,
                    quantity: item.quantity
                })),
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!checkoutResponse.data || !checkoutResponse.data.orderId) {
                throw new Error('Không thể tạo đơn hàng');
            }

            // Bước 2: Tạo thanh toán VNPay
            const paymentResponse = await api.post(
                'Payments/createVnpPayment',
                {
                    amount: calculateSubtotal(),
                    orderId: checkoutResponse.data.orderId
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (paymentResponse.data && paymentResponse.data.paymentUrl) {
                // Clear the cart here
                clearCart(); 
                localStorage.removeItem('cartItems'); 
                localStorage.setItem('currentOrderId', checkoutResponse.data.orderId);
                window.location.href = paymentResponse.data.paymentUrl;
            } else {
                throw new Error('Không thể tạo URL thanh toán');
            }
        } catch (error) {
            console.error('Checkout and payment error:', error);
            alert('Có lỗi xảy ra khi xử lý đơn hàng và thanh toán. Vui lòng thử lại.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <>
            <Header />
            <div className="py-24 relative">
                <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
                    <h2 className="title font-manrope font-bold text-4xl leading-10 mb-8 text-center text-black">Giỏ hàng</h2>
                    {cartItems.map((item) => (
                        <div key={item.flowerId} className="rounded-3xl border-2 border-gray-200 p-4 lg:p-8 grid grid-cols-12 mb-8 max-lg:max-w-lg max-lg:mx-auto gap-y-4">
                            <div className="col-span-12 lg:col-span-2 img box">
                                <img src={item.imageUrl} alt={item.flowerName} className="max-lg:w-full lg:w-[180px] rounded-lg object-cover" />
                            </div>
                            <div className="col-span-12 lg:col-span-10 detail w-full lg:pl-3">
                                <div className="flex items-center justify-between w-full mb-4">
                                    <h5 className="font-medium text-3xl leading-9 text-gray-900">{item.flowerName}</h5>
                                    <button onClick={() => removeFromCart(item.flowerId)} className="rounded-full group flex items-center justify-center focus-within:outline-red-500 ">
                                        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle className="fill-red-50 transition-all duration-500 group-hover:fill-red-400" cx="17" cy="17" r="17" fill="" />
                                            <path className="stroke-red-500 transition-all duration-500 group-hover:stroke-white" d="M14.1673 13.5997V12.5923C14.1673 11.7805 14.8223 11.1255 15.6342 11.1255H18.3673C19.1792 11.1255 19.8342 11.7805 19.8342 12.5923V13.5997M21.3332 13.5997V21.4082C21.3332 22.22 20.6782 22.875 19.8663 22.875H14.1353C13.3235 22.875 12.6685 22.22 12.6685 21.4082V13.5997M22.8748 13.5997H11.1268" stroke="" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => updateQuantity(item.flowerId, item.quantity - 1)}
                                            disabled={item.quantity <= 1}
                                            className="group rounded-[50px] border border-gray-200 shadow-sm shadow-transparent p-2.5 flex items-center justify-center bg-white transition-all duration-500 hover:shadow-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-within:outline-gray-300"
                                        >
                                            <svg className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M4.5 9.5H13.5" stroke="" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                        <input
                                            type="text"
                                            value={item.quantity}
                                            readOnly
                                            className="border border-gray-200 rounded-full w-10 aspect-square outline-none text-gray-900 font-semibold text-sm py-1.5 px-3 bg-gray-100 text-center"
                                        />
                                        <button
                                            onClick={() => updateQuantity(item.flowerId, item.quantity + 1)}
                                            className="group rounded-[50px] border border-gray-200 shadow-sm shadow-transparent p-2.5 flex items-center justify-center bg-white transition-all duration-500 hover:shadow-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-within:outline-gray-300"
                                        >
                                            <svg className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M3.75 9.5H14.25M9 14.75V4.25" stroke="" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </div>
                                    <h6 className="text-indigo-600 font-manrope font-bold text-2xl leading-9 text-right"><p className="text-black text-lg">Đơn giá</p>{(item.price).toLocaleString()}₫</h6>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="flex flex-col md:flex-row items-center md:items-center justify-between lg:px-6 pb-6 border-b border-gray-300 max-lg:max-w-lg max-lg:mx-auto">
                        <h5 className="text-gray-900 font-manrope font-semibold text-2xl leading-9 w-full max-md:text-center max-md:mb-4">Tổng tiền</h5>
                        <div className="flex items-center justify-between gap-5">
                            <h6 className="font-manrope font-bold text-3xl lead-10 text-indigo-600">{calculateSubtotal().toLocaleString()}₫</h6>
                        </div>
                    </div>
                    <div className="max-lg:max-w-lg max-lg:mx-auto">
                        <p className="font-normal text-base leading-7 text-gray-500 text-center mb-5 mt-6">Phí vận chuyển đã bao gồm trong thanh toán</p>
                        <button
                            onClick={handleCheckoutAndPayment}
                            disabled={cartItems.length === 0 || isCheckingOut}
                            className="rounded-full py-4 px-6 bg-gray-600 text-white font-semibold text-lg w-full text-center transition-all duration-500 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isCheckingOut ? 'Đang xử lý...' : 'Thanh toán với VNPay'}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Cart;