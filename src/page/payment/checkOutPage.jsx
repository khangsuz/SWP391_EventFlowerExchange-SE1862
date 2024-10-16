import React, { useState, useEffect, useCallback  } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../component/header';
import Footer from '../../component/footer';
import api from '../../config/axios';
import { Notification, notifySuccess, notifyError } from "../../component/alert";

function CheckoutPage() {
    const navigate = useNavigate();
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [shippingFee, setShippingFee] = useState(0);
    const [cartItems, setCartItems] = useState([]);
    const [userInfo, setUserInfo] = useState({
        fullName: '',
        phone: '',
        email: '',
        address: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedWardName, setSelectedWardName] = useState(''); // Thêm state để lưu tên phường

    useEffect(() => {
        const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
        setCartItems(storedCart);
        fetchUserInfo();
        fetchDistricts();
    }, []);


    useEffect(() => {
        if (selectedDistrict) {
            fetchWards(selectedDistrict);
            setSelectedWard('');
            setShippingFee(0);
        }
    }, [selectedDistrict]);

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
            const shippingRequest = {
                from_district_id: 1442,
                to_district_id: selectedDistrict,
                to_ward_code: selectedWard,
                weight: 5000 * cartItems.length,
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
    }, [selectedDistrict, selectedWard, cartItems, navigate]);

    useEffect(() => {
        handleShippingFeeCalculation();
    }, [handleShippingFeeCalculation]);

    const fetchUserInfo = async () => {
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
            setUserInfo(response.data);
        } catch (error) {
            console.error('Error fetching user info:', error);
            notifyError('Không thể lấy thông tin người dùng. Vui lòng thử lại sau.');
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
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const calculateTotal = () => {
        const total = cartItems.reduce((total, item) => total + item.price * item.quantity, 0) + shippingFee;
        return total >= 0 ? total : 0;
    };


    const createShippingOrder = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            notifyError('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }

        const shippingOrder = {
            from_name: 'Shop Hoa ABC',
            from_phone: '0901234567',
            from_address: '72 Lê Thánh Tôn, Phường Bến Nghé',
            from_ward_name: 'Phường Bến Nghé',
            from_district_name: 'Quận 1',
            from_province_name: 'TP Hồ Chí Minh',
            to_name: userInfo.fullName,
            to_phone: userInfo.phone,
            to_address: userInfo.address,
            to_ward_name: selectedWardName,
            to_ward_code: selectedWard,
            to_district_id: selectedDistrict,
            weight: 500 * cartItems.length,
            length: 30,
            width: 20,
            height: 10,
            required_note: "CHOXEMHANGKHONGTHU",
            items: cartItems.map(item => ({
                name: item.flowerName,
                code: String(item.flowerId),
                quantity: item.quantity,
                price: item.price
            }))
        };

        try {
            const response = await api.post('Shipping/create-order', shippingOrder, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating shipping order:', error.response ? error.response.data : error.message);
            notifyError('Không thể tạo đơn hàng giao hàng. Vui lòng thử lại sau.');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) {
            notifyError('Vui lòng đăng nhập trước khi thanh toán');
            navigate('/login');
            return;
        }

        if (!selectedDistrict || !selectedWard) {
            notifyError('Vui lòng chọn quận/huyện và phường/xã trong TP. Hồ Chí Minh.');
            return;
        }

        if (!paymentMethod) {
            notifyError('Vui lòng chọn phương thức thanh toán.');
            return;
        }

        setIsProcessing(true);
        try {
            await handleShippingFeeCalculation();

            const cartItemsToSend = cartItems.map((item) => ({
                flowerId: item.flowerId,
                quantity: item.quantity
            }));

            const checkoutResponse = await api.post(
                'Orders/checkout',
                cartItemsToSend,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            const shippingOrderResponse = await createShippingOrder();
            if (shippingOrderResponse) {
                const paymentResponse = await api.post(
                    'Payments/createVnpPayment',
                    {
                        Amount: calculateTotal(),
                        ...userInfo
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                notifySuccess('Đặt hàng thành công. Chuyển đến trang thanh toán');
                localStorage.setItem('pendingOrderId', checkoutResponse.data.orderId);
                window.location.href = paymentResponse.data.paymentUrl;
            }
            
        } catch (error) {
            notifyError('Thanh toán thất bại');
            if (error.response) {
                notifyError(`Thanh toán thất bại: ${error.response.data}`);
            } else if (error.request) {
                notifyError('Lỗi mạng. Vui lòng kiểm tra kết nối và thử lại.');
            } else {
                notifyError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
            }
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDistrictChange = (e) => {
        setSelectedDistrict(e.target.value);
        setSelectedWard('');
        setShippingFee(0);
    };

    const handleWardChange = (e) => {
        const selectedWardCode = e.target.value;
        setSelectedWard(selectedWardCode);
        const selectedWardData = wards.find(ward => ward.wardCode === selectedWardCode);
        if (selectedWardData) {
            setSelectedWardName(selectedWardData.wardName);
        }
    };

    return (
        <>
        <Notification />
        <Header />
            <div className="container mx-auto px-4 py-8 flex">
                <div className="w-full md:w-2/3 px-4">
                    <h2 className="text-2xl text-amber-500 font-bold mb-4">Thông tin thanh toán</h2>
                    <form onSubmit={handleSubmit}>
                        {/* Form Thông Tin Thanh Toán */}
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
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Địa chỉ email *</label>
                            <input
                                type="email"
                                name="email"
                                value={userInfo.email}
                                onChange={handleInputChange}
                                className="w-full p-2 border rounded"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Thành phố *</label>
                            <select
                                name="province"
                                className="w-full p-2 border rounded"
                                value="202"
                                disabled
                            >
                                <option value="202">TP. Hồ Chí Minh</option>
                            </select>
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
                                    <option key={district.districtId} value={district.districtId}>
                                        {district.districtName}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="mb-4">
                            <label className="block font-bold mb-2">Phường/Xã *</label>
                            <select
                                name="ward"
                                value={selectedWard}
                                onChange={handleWardChange}
                                className="w-full p-2 border rounded"
                                required
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
                    </form>
                </div>
                <div className="w-full md:w-2/4 px-4">

                    {/* Đơn Hàng Của Bạn */}
                    <h2 className="text-2xl text-amber-500 font-bold mb-4">Đơn hàng của bạn</h2>
                    <div className="border p-4 rounded">
                        <div className="flex justify-between">
                            <span className="text-lg font-bold">SẢN PHẨM</span>
                            <span className="text-lg font-bold">TẠM TÍNH</span>
                        </div>
                        {cartItems.map((item) => (
                            <div key={item.flowerId} className="mb-2 flex border-t pt-2 mt-2 justify-between">
                                <span>{item.flowerName} x {item.quantity}</span>
                                <span className="text-red-500 font-bold">{(item.price * item.quantity).toLocaleString()}₫</span>
                            </div>
                        ))}
                        <div className="flex justify-between border-t pt-2 mt-2">
                            <span className="font-bold">Tạm tính</span>
                            <span className="text-red-500 font-bold">{cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toLocaleString()}₫</span>
                        </div>
                        <div className="flex justify-between mt-2">
                            <span>Phí giao hàng</span>
                            <span>{shippingFee > 0 ? `${shippingFee.toLocaleString()}₫` : 'Nhập địa chỉ để xem các tùy chọn vận chuyển'}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2 mt-2 font-bold">
                            <span>Tổng</span>
                            <span>{calculateTotal().toLocaleString()}₫</span>
                        </div>
                    </div>

                    {/* Phương Thức Thanh Toán */}
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
                        className="w-full bg-green-500 text-white p-4 rounded"
                        disabled={isProcessing && !paymentMethod}
                    >
                        {isProcessing ? 'Đang xử lý...' : 'Đặt hàng'}
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default CheckoutPage;