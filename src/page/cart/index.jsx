import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import api from "../../config/axios";
import { message } from 'antd';
import "../../index.css";
import Header from "../../component/header";
import Footer from "../../component/footer";
import { getFullImageUrl } from '../../utils/imageHelpers';
import { Notification, notifyError, notifySuccess } from '../../component/alert';
import LoadingComponent from '../../component/loading'; 

function Cart() {
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [loading, setLoading] = useState(true);
    const { updateCartItemCount } = useCart();
    const [groupedCartItems, setGroupedCartItems] = useState({});

    const fetchCartItems = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await api.get('Cart', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Cart API Response:', response.data);

            if (response.data) {
                const items = response.data.items || [];
                
                const transformedItems = items.map(item => ({
                    cartItemId: item.cartItemId,
                    flowerId: item.flowerId,
                    flowerName: item.flowerName || 'Unnamed Product',
                    price: item.price || 0,
                    quantity: item.quantity || 1,
                    imageUrl: item.imageUrl ? getFullImageUrl(item.imageUrl) : '/images/default-flower.jpg',
                    sellerFullName: item.sellerFullName || "Unknown Seller",
                    isCustomOrder: item.isCustomOrder || false
                }));
                
                const grouped = transformedItems.reduce((acc, item) => {
                    const key = item.sellerFullName;
                    
                    if (!acc[key]) {
                        acc[key] = [];
                    }
                    acc[key].push(item);
                    return acc;
                }, {});

                setCartItems(transformedItems);
                setGroupedCartItems(grouped);
                updateCartItemCount(transformedItems.length);
            } else {
                setCartItems([]);
                setGroupedCartItems({});
                updateCartItemCount(0);
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            notifyError('Không thể tải giỏ hàng');
            setCartItems([]);
            setGroupedCartItems({});
            updateCartItemCount(0);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCartItems();
    }, []);

    const updateQuantity = async (cartItemId, newQuantity) => {
        try {
            const token = localStorage.getItem('token');
            await api.put('Cart/update-quantity', 
                {
                    cartItemId: cartItemId,
                    quantity: newQuantity
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            await fetchCartItems();
            notifySuccess('Đã cập nhật số lượng');
        } catch (error) {
            console.error('Error updating quantity:', error);
            notifyError('Không thể cập nhật số lượng');
        }
    };

    const removeFromCart = async (cartItemId) => {
        try {
            const token = localStorage.getItem('token');
            await api.delete(`Cart/remove-item/${cartItemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            await fetchCartItems();
            notifySuccess('Đã xóa sản phẩm khỏi giỏ hàng');
        } catch (error) {
            console.error('Error removing item:', error);
            notifyError('Không thể xóa sản phẩm');
        }
    };

    const calculateSellerSubtotal = (items) => {
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    };

    const handlePayment = async (sellerFullName, items) => {
        if (items.length === 0) {
            notifyError('Giỏ hàng của bạn đang trống');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            notifyError('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }
    
        setIsCheckingOut(true);
        try {
            const checkoutData = {
                sellerFullName,
                items: items.map(item => ({
                    cartItemId: item.cartItemId,
                    flowerId: item.flowerId,
                    flowerName: item.flowerName,
                    price: item.price,
                    quantity: item.quantity,
                    imageUrl: item.imageUrl,
                    isCustomOrder: item.isCustomOrder
                })),
                subtotal: calculateSellerSubtotal(items)
            };
    
            localStorage.setItem('itemsBeingPurchased', JSON.stringify({
                sellerFullName,
                itemIds: items.map(item => item.cartItemId)
            }));
    
            navigate('/checkout', { state: checkoutData });
        } catch (error) {
            console.error('Payment processing error:', error);
            notifyError('Đã xảy ra lỗi trong quá trình thanh toán');
        } finally {
            setIsCheckingOut(false);
        }
    };

    // Thêm useEffect để lắng nghe kết quả thanh toán
    useEffect(() => {
        const handlePaymentResult = async () => {
            const paymentSuccess = localStorage.getItem('paymentSuccess');
            if (paymentSuccess) {
                try {
                    await fetchCartItems(); // Refresh cart after payment
                    notifySuccess('Đơn hàng đã được thanh toán thành công');
                    
                    // Xóa dữ liệu tạm
                    localStorage.removeItem('paymentSuccess');
                    localStorage.removeItem('itemsBeingPurchased');
                } catch (error) {
                    console.error('Error updating cart after payment:', error);
                    notifyError('Có lỗi xảy ra khi cập nhật giỏ hàng');
                }
            }
        };

        handlePaymentResult();
    }, []);

    if (loading) {
        return <LoadingComponent />;
    }

    const isCartEmpty = !cartItems.length;

    // JSX remains mostly the same, just update the item references
    return (
        <>
            <Notification />
            <Header />
            <div className="py-24 relative">
                <div className="w-full max-w-7xl px-4 md:px-5 lg-6 mx-auto">
                    <h2 className="title font-manrope font-bold text-4xl leading-10 mb-8 text-center text-black">Giỏ hàng</h2>
                    
                    {isCartEmpty ? (
                        <div className="text-center py-16">
                            <div className="mb-6">
                                <svg className="mx-auto w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h3>
                            <p className="text-gray-500 mb-8">Hãy thêm một vài sản phẩm vào giỏ hàng của bạn</p>
                            <button 
                                onClick={() => navigate('/products')}
                                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Tiếp tục mua sắm
                            </button>
                        </div>
                    ) : (
                        <div className="grid lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                {Object.entries(groupedCartItems).map(([sellerFullName, items]) => (
                                    <div key={sellerFullName} className="mb-8 border-2 border-gray-200 rounded-3xl p-4">
                                        <h3 className="font-manrope font-bold text-2xl text-indigo-500">
                                            {sellerFullName}
                                        </h3>
                                        {items.map((item) => (
                                            <div key={item.cartItemId} className="rounded-3xl border-2 border-gray-200 p-4 lg:p-8 grid grid-cols-12 mb-8 max-lg:max-w-lg max-lg:mx-auto gap-y-4">
                                                <div className="col-span-12 lg:col-span-2 img box">
                                                    <img 
                                                        src={item.imageUrl || '/images/default-flower.jpg'} // Sử dụng ảnh mặc định
                                                        alt={item.flowerName}
                                                        className="max-lg:w-full lg:w-[180px] rounded-lg object-cover"
                                                        onError={(e) => {
                                                            e.target.src = '/images/default-flower.jpg'; // Fallback khi ảnh lỗi
                                                            e.target.onerror = null; // Prevent infinite loop
                                                        }}
                                                    />
                                                </div>
                                                <div className="col-span-12 lg:col-span-10 detail w-full lg:pl-3">
                                                    <div className="flex items-center justify-between w-full mb-4">
                                                        <h5 className="font-medium text-3xl leading-9 text-gray-900">
                                                            {item.flowerName}
                                                            {item.isCustomOrder && 
                                                                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                                    Tùy chỉnh
                                                                </span>
                                                            }
                                                        </h5>
                                                        <button onClick={() => removeFromCart(item.cartItemId)} className="rounded-full group flex items-center justify-center focus-within:outline-red-500">
                                                            <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                <circle className="fill-red-50 transition-all duration-500 group-hover:fill-red-400" cx="17" cy="17" r="17" fill="" />
                                                                <path className="stroke-red-500 transition-all duration-500 group-hover:stroke-white" d="M14.1673 13.5997V12.5923C14.1673 11.8968 14.7311 11.333 15.4266 11.333H18.5747C19.2702 11.333 19.834 11.8968 19.834 12.5923V13.5997M19.834 13.5997C19.834 13.5997 14.6534 13.5997 11.334 13.5997C6.90804 13.5998 27.0933 13.5998 22.6673 13.5997C21.5608 13.5997 19.834 13.5997 19.834 13.5997ZM12.4673 13.5997H21.534V18.8886C21.534 20.6695 21.534 21.5599 20.9807 22.1131C20.4275 22.6664 19.5371 22.6664 17.7562 22.6664H16.2451C14.4642 22.6664 13.5738 22.6664 13.0206 22.1131C12.4673 21.5599 12.4673 20.6695 12.4673 18.8886V13.5997Z" stroke="#EF4444" strokeWidth="1.6" strokeLinecap="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-4">
                                                            <button
                                                                onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
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
                                                                onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                                                                className="group rounded-[50px] border border-gray-200 shadow-sm shadow-transparent p-2.5 flex items-center justify-center bg-white transition-all duration-500 hover:shadow-gray-200 hover:bg-gray-50 hover:border-gray-300 focus-within:outline-gray-300"
                                                            >
                                                                <svg className="stroke-gray-900 transition-all duration-500 group-hover:stroke-black" width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path d="M3.75 9.5H14.25M9 14.75V4.25" stroke="" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                        <h6 className="text-indigo-600 font-manrope font-bold text-2xl leading-9 text-right">
                                                            <p className="text-black text-lg">Đơn giá</p>
                                                            {(item.price).toLocaleString()}₫
                                                        </h6>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button
                                            onClick={() => handlePayment(sellerFullName, items)}
                                            disabled={items.length === 0 || isCheckingOut}
                                            className="mt-4 rounded-full py-4 px-6 bg-gray-600 text-white font-semibold text-lg w-full text-center transition-all duration-500 hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                            {isCheckingOut ? 'Đang xử lý...' : `Thanh toán đơn hàng từ ${sellerFullName}`}
                                        </button>
                                        <div className="flex justify-between items-center mt-4">
                                            <h5 className="text-gray-900 font-manrope font-semibold text-2xl">
                                                Tổng đơn hàng
                                            </h5>
                                            <h6 className="font-manrope font-bold text-3xl text-indigo-600">
                                                {calculateSellerSubtotal(items).toLocaleString()}₫
                                            </h6>
                                        </div>
                                    </div>
                                ))}
                            </div>
    
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
                                    <h3 className="text-lg font-semibold mb-4">Tổng đơn hàng</h3>
                                    <div className="space-y-3">
                                        {Object.entries(groupedCartItems).map(([sellerFullName, items]) => (
                                            <div key={sellerFullName} className="flex justify-between text-sm">
                                                <span className="text-gray-600">
                                                    {sellerFullName}
                                                </span>
                                                <span className="font-medium">
                                                    {calculateSellerSubtotal(items).toLocaleString()}₫
                                                </span>
                                            </div>
                                        ))}
                                        <div className="border-t pt-3 mt-3">
                                            <div className="flex justify-between text-lg font-semibold">
                                                <span>Tổng cộng</span>
                                                <span className="text-indigo-600">
                                                    {Object.values(groupedCartItems)
                                                        .reduce((total, items) => total + calculateSellerSubtotal(items), 0)
                                                        .toLocaleString()}₫
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}

export default Cart;