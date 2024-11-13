import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../component/header';
import Footer from '../../component/footer';
import api from '../../config/axios';
import { useCart } from "../../contexts/CartContext";
import { Modal } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Notification, notifySuccess, notifyError } from "../../component/alert";

function CheckoutPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { sellerName, items, subtotal } = location.state || {};
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [shippingFee, setShippingFee] = useState(0);
    const { updateCartItemCount } = useCart();
    const [cartItems, setCartItems] = useState([]);
    const [isButtonDisabled, setIsButtonDisabled] = useState(false);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
        districtId: '',
        wardCode: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedWardName, setSelectedWardName] = useState('');
    const [selectedDistrictName, setSelectedDistrictName] = useState('');
    const [fullAddress, setFullAddress] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);  // Add this new state

    const groupCartItemsBySeller = (items) => {
        return items.reduce((acc, item) => {
            const sellerName = item.sellerName || 'Unknown Seller';
            if (!acc[sellerName]) {
                acc[sellerName] = [];
            }
            acc[sellerName].push(item);
            return acc;
        }, {});
    };

    useEffect(() => {
        if (items) {
            setCartItems(items);
        } else {
            // Redirect back to cart if no items are passed
            navigate('/cart');
        }
    }, [items, navigate]);

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        console.log('Stored Cart:', storedCart);
        setCartItems(storedCart);
        // Xóa hoặc comment out dòng dưới đây
        // const grouped = groupCartItemsBySeller(storedCart);
        // console.log('Grouped Cart:', grouped);
        // setGroupedCartItems(grouped);
        fetchUserInfo();
        fetchDistricts();
    }, []);

    useEffect(() => {
        if (selectedDistrict) {
            fetchWards(selectedDistrict);
            if (selectedDistrict !== userInfo.districtId) {
                setSelectedWard('');
                setShippingFee(0);
            }
        }
    }, [selectedDistrict]);

    useEffect(() => {
        const addressParts = [
            userInfo.address,
            selectedWardName,
            selectedDistrictName,
            'TP Hồ Chí Minh'
        ].filter(Boolean);
        setFullAddress(addressParts.join(', '));
    }, [userInfo.address, selectedWardName, selectedDistrictName]);

    const calculateTotalWeight = useCallback(() => {
        return items.reduce((total, item) => total + 5000 * item.quantity, 0);
    }, [items]);

    const handleShippingFeeCalculation = useCallback(async () => {
        if (!selectedDistrict || !selectedWard) {
            setShippingFee(0);
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            notifyError('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }

        try {
            const totalWeight = calculateTotalWeight();
            const shippingRequest = {
                from_district_id: 1442,
                to_district_id: selectedDistrict,
                to_ward_code: selectedWard,
                weight: totalWeight,
                length: 30,
                width: 30,
                height: 30
            };
            const response = await api.post('Shipping/calculate-shipping-fee', shippingRequest, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data && response.data.data) {
                setShippingFee(response.data.data.total);
            } else {
                console.error('Unexpected response structure:', response);
                notifyError('Shop chưa hỗ trợ giao hàng đến địa chỉ này.');
            }
        } catch (error) {
            console.error('Error calculating shipping fee:', error);
            notifyError('Shop chưa hỗ trợ giao hàng đến địa chỉ này.');
        }
    }, [selectedDistrict, selectedWard, cartItems, navigate, calculateTotalWeight]);

    useEffect(() => {
        handleShippingFeeCalculation();
    }, [handleShippingFeeCalculation]);

    const fetchUserInfo = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
            notifyError('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }

        try {
            const response = await api.get('Users/profile', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            if (response.data) {
                setUserInfo(response.data);
                setSelectedDistrict(response.data.districtId ? response.data.districtId.toString() : '');
                if (response.data.districtId) {
                    await fetchWards(response.data.districtId);
                }
                setSelectedWard(response.data.wardCode || '');
            } else {
                notifyError('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
            }
        } catch (error) {
            console.error('Error fetching user info:', error);
            notifyError('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDistricts = async () => {
        try {
            const response = await api.get('Shipping/districts?provinceId=202');
            setDistricts(response.data);
        } catch (error) {
            console.error('Error fetching districts:', error);
        }
    };

    const fetchWards = async (districtId) => {
        try {
            const response = await api.get(`Shipping/wards?district_id=${districtId}`);
            setWards(response.data);
            if (response.data.length > 0) {
                setSelectedWardName(response.data[0].wardName);
            }
        } catch (error) {
            console.error('Error fetching wards:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value || '' }));
    };

    const calculateTotal = () => {
        const total = items.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee;
        return total >= 0 ? total : 0;
    };

    const tamtinh = () => {
        const total = items.reduce((total, item) => total + item.price * item.quantity, 0);
        return total >= 0 ? total : 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Kiểm tra nếu đang xử lý thì không cho submit nữa
        if (isSubmitting || isProcessing) {
            return;
        }

        if (userInfo.fullName === '' || userInfo.phone === '' || userInfo.email === '' || userInfo.address === '' || selectedDistrict === '' || selectedWard === '') {
            notifyError('Vui lòng nhập đầy đủ thông tin');
            return;
        }
        
        // Kiểm tra phương thức thanh toán
        if (!paymentMethod) {
            notifyError('Vui lòng chọn phương thức thanh toán');
            return;
        }

        // Kiểm tra địa chỉ
        if (!selectedDistrict || !selectedWard || !userInfo.address) {
            notifyError('Vui lòng nhập đầy đủ thông tin địa chỉ');
            return;
        }

        // Hiển thị modal xác nhận
        Modal.confirm({
            title: 'Xác nhận đặt hàng',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p>Bạn có chắc chắn muốn đặt đơn hàng này?</p>
                    <div className="mt-4 p-3 bg-gray-50 rounded">
                        <div className="mb-4">
                            <span className="font-medium">Sản phẩm:</span>
                            <div className="mt-2 space-y-2">
                                {items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            {item.flowerName} x {item.quantity}
                                        </div>
                                        <span className="font-medium">
                                            {(item.price * item.quantity).toLocaleString()}₫
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className='font-medium'>Phí giao hàng:</span>
                            <span className="font-medium">{shippingFee.toLocaleString()}₫</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-bold">Tổng cộng:</span>
                            <span className="font-bold text-red-600">{calculateTotal().toLocaleString()}₫</span>
                        </div>
                    </div>
                </div>
            ),
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    // Đặt các flag để prevent double submit
                    setIsSubmitting(true);
                    setIsButtonDisabled(true);
                    setIsProcessing(true);

                    const token = localStorage.getItem('token');
                    if (!token) {
                        notifyError('Vui lòng đăng nhập trước khi thanh toán');
                        navigate('/login');
                        return;
                    }

                    // Group items by seller
                    const itemsBySeller = groupCartItemsBySeller(items);

                    // Process each seller's items separately
                    for (const [sellerName, sellerItems] of Object.entries(itemsBySeller)) {
                        const cartItemsToSend = sellerItems.map((item) => ({
                            flowerId: item.flowerId,
                            quantity: item.quantity,
                            sellerId: item.sellerId
                        }));

                        // Create order
                        const checkoutResponse = await api.post(
                            'Orders/checkout',
                            cartItemsToSend,
                            {
                                params: {
                                    fullAddress: fullAddress,
                                    wardCode: selectedWard,
                                    wardName: selectedWardName,
                                    toDistrictId: parseInt(selectedDistrict, 10),
                                    note: note
                                },
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                }
                            }
                        );

                        if (checkoutResponse.data) {
                            // Create payment
                            const paymentResponse = await api.post(
                                'Payments/createVnpPayment',
                                {
                                    Amount: calculateSellerTotal(sellerItems)
                                },
                                {
                                    headers: {
                                        Authorization: `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                    }
                                }
                            );

                            if (paymentResponse.data && paymentResponse.data.paymentUrl) {
                                // Update cart
                                const currentCart = JSON.parse(localStorage.getItem('cart') || '[]');
                                const updatedCart = currentCart.filter(item =>
                                    !sellerItems.some(sellerItem =>
                                        sellerItem.flowerId === item.flowerId
                                    )
                                );
                                localStorage.setItem('cart', JSON.stringify(updatedCart));
                                updateCartItemCount(updatedCart.length);

                                // Store payment amount
                                localStorage.setItem('paymentAmount', calculateSellerTotal(sellerItems));

                                // Redirect to payment URL
                                window.location.href = paymentResponse.data.paymentUrl;
                                return;
                            }
                        }
                    }
                } catch (error) {
                    console.error('Checkout error:', error);
                    if (error.response?.data) {
                        notifyError(`Lỗi: ${error.response.data}`);
                    } else {
                        notifyError('Đã xảy ra lỗi trong quá trình đặt hàng. Vui lòng thử lại.');
                    }
                } finally {
                    setIsProcessing(false);
                    setIsButtonDisabled(false);
                    setIsSubmitting(false);
                }
            },
            onCancel() {
                // Reset các state khi người dùng hủy
                setIsProcessing(false);
                setIsButtonDisabled(false);
                setIsSubmitting(false);
            },
        });
    };

    // Helper function to calculate total for a seller's items
    const calculateSellerTotal = (sellerItems) => {
        return sellerItems.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee;
    };

    const handlePaymentError = (error) => {
        console.error('Payment error:', error);
        if (error.response) {
            console.error('Error response data:', error.response.data);
            notifyError(`Thanh toán thất bại: ${error.response.data}`);
        } else if (error.request) {
            console.error('Error request:', error.request);
            notifyError('Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.');
        } else {
            console.error('Error message:', error.message);
            notifyError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
        }
    };

    const handleDistrictChange = (e) => {
        const districtId = e.target.value;
        setSelectedDistrict(districtId || '');
        const district = districts.find(d => d.districtId === parseInt(districtId, 10));
        if (district) {
            setSelectedDistrictName(district.districtName);
        } else {
            setSelectedDistrictName('');
        }
        if (districtId !== selectedDistrict) {
            setSelectedWard('');
            setShippingFee(0);
        }
        fetchWards(districtId);
    };

    const handleWardChange = (e) => {
        const selectedWardCode = e.target.value;
        setSelectedWard(selectedWardCode);
        setUserInfo(prev => ({ ...prev, wardCode: selectedWardCode }));
        const selectedWardData = wards.find(ward => ward.wardCode === selectedWardCode);
        if (selectedWardData) {
            setSelectedWardName(selectedWardData.wardName);
        }
    };

    useEffect(() => {
        console.log('Selected Ward:', selectedWard);
        console.log('User Info Ward Code:', userInfo.wardCode);
    }, [selectedWard, userInfo.wardCode]);

    useEffect(() => {
        if (userInfo.wardCode && !selectedWard) {
            setSelectedWard(userInfo.wardCode);
        }
    }, [userInfo.wardCode, selectedWard]);

    const handleNoteChange = (e) => {
        setNote(e.target.value || '');
    };

    const validatePhoneNumber = (phone) => {
        const phoneRegex = /^(03|05|07|08|09)\d{8}$/;
        return phoneRegex.test(phone);
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    return (
        <>
            <Notification />
            <Header />
            <div className="container mx-auto px-4 py-8 flex">
                <div className="w-full md:w-2/3 px-4">
                    <h2 className="text-2xl text-amber-500 font-bold mb-4">Thông tin thanh toán</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Họ và tên *</label>
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
                            <label className="block font-bold mb-2">Số điện thoại *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={userInfo.phone}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded ${!validatePhoneNumber(userInfo.phone) && userInfo.phone ? 'border-red-500' : ''}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                onChange={handleInputChange}
                                className={`w-full p-2 border rounded ${!validateEmail(userInfo.email) && userInfo.email ? 'border-red-500' : ''}`}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Quận/Huyện *</label>
                            <select
                                name="district"
                                value={selectedDistrict}
                                onChange={handleDistrictChange}
                                className="w-full p-2 border rounded"
                                required
                            >
                                <option value="">Chọn quận/huyện</option>
                                {districts.map((district) => (
                                    <option key={district.districtId} value={district.districtId.toString()}>
                                        {district.districtName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Phưng/Xã *</label>
                            <select
                                name="ward"
                                value={selectedWard}
                                onChange={handleWardChange}
                                className="w-full p-2 border rounded"
                                required
                                disabled={isLoading}
                            >
                                <option value="">Chọn phường/xã</option>
                                {wards.map((ward) => (
                                    <option key={ward.wardCode} value={ward.wardCode}>
                                        {ward.wardName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Địa chỉ *</label>
                            <input
                                type="text"
                                name="address"
                                value={userInfo.address}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                placeholder="Ví dụ: Số 20 đường Cầu Giấy"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Ghi chú</label>
                            <textarea
                                name="note"
                                value={note || ''}
                                onChange={handleNoteChange}
                                className="w-full p-2 border rounded"
                                placeholder="Nhập ghi chú cho đơn hàng (nếu có)"
                                rows="3"
                            />
                        </div>
                    </form>
                </div>
                <div className="w-full md:w-2/4 px-4">
                    <h2 className="text-2xl text-amber-500 font-bold mb-4">Đơn hàng của bạn</h2>
                    <div className="border p-4 rounded">
                        <div className="flex justify-between">
                            <span className="text-lg font-bold">SẢN PHẨM</span>
                            <span className="text-lg font-bold">TM TÍNH</span>
                        </div>
                        {items && items.map((item) => (
                            <div key={item.flowerId} className="mb-2 flex border-t pt-2 mt-2 justify-between">
                                <span>{item.flowerName} x {item.quantity}</span>
                                <span className="text-red-500 font-bold">{(item.price * item.quantity).toLocaleString()}₫</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span >Tạm tính</span>
                            <span className="text-red-500 font-bold ">{tamtinh().toLocaleString()}₫</span>

                        </div>
                        <div className="flex justify-between mt-2">
                            <span>Phí giao hàng</span>
                            <span>{shippingFee > 0 ? `${shippingFee.toLocaleString()}₫` : 'Nhập địa chỉ để xem các tùy chọn vận chuyển'}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                            <span>Tổng</span>
                            <span className="text-red-600 font-bold">{calculateTotal().toLocaleString()}₫</span>
                        </div>

                    </div>
                    <h3 className="text-xl font-bold mt-6 mb-4">Thanh toán</h3>
                    <div className="flex mb-4">
                        <input
                            type="radio"
                            name="paymentMethod"
                            value="VnPay"
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        />
                        <label className="mt-5 ml-4">Thanh toán VnPay</label>
                        <img className="h-16 ml-auto" src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VnPay" />
                    </div>
                    <button
                        onClick={handleSubmit}
                        className={`w-full p-4 rounded ${isSubmitting || isProcessing || !paymentMethod
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-500 hover:bg-green-600'
                            } text-white`}
                        disabled={isSubmitting || isProcessing || !paymentMethod}
                    >
                        {isProcessing ? 'Đang xử lý...' : isSubmitting ? 'Đã đặt hàng' : 'Đặt hàng'}
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CheckoutPage;