import { useEffect, useState } from "react";
import Header from "../../component/header";
import "../../index.css";
import api from "../../config/axios";
import Footer from "../../component/footer";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../contexts/CartContext";
import { Notification, notifySuccess, notifyError } from '../../component/alert';
const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [userType, setUserType] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [success, setSuccess] = useState(null);
    const { updateCartItemCount } = useCart();
    const [profileImage, setProfileImage] = useState(null); 
    const [imageUrl, setImageUrl] = useState(''); 

    const fetchUserData = async () => {
        try {
            const response = await api.get('/Users/profile');
            setUserData(response.data);
            setEditedData(response.data);
            setImageUrl(response.data.profileImageUrl);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load user data. Please try again later.");
        }
    };

    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
            setUserType(user.userType);
            fetchUserData();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const clearCart = () => {
        setCartItems([]);
        localStorage.setItem('cart', JSON.stringify([]));
        updateCartItemCount();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        clearCart();
        notifySuccess("Đăng xuất thành công!");
        navigate('/login');
    }

    const handleEdit = () => {
        setIsEditing(true);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(userData);
        setProfileImage(null);
        setError(null);
        setSuccess(null);
    };

    const handleChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const imageUrl = URL.createObjectURL(file);
            setEditedData({ ...editedData, profileImageUrl: imageUrl });
            setImageUrl(imageUrl); // Cập nhật URL tạm thời chỉ để xem trước
        }
    };

    const handleSave = async () => {
        let isValid = true;
        if (editedData.name !== userData.name) {
            const nameRegex = /^[^\s!@#$%^&*()_+={}\[\]:;"'<>,.?~]+$/;
            if (!nameRegex.test(editedData.name)) {
                alert("Tên không được chứa dấu cách hoặc ký tự đặc biệt.");
                isValid = false;
            }
        }

        if (editedData.email !== userData.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(editedData.email)) {
                notifyError("Email không hợp lệ.");
                isValid = false;
            }
        }

        if (editedData.phone !== userData.phone) {
            const phoneRegex = /^\d{10,11}$/;
            if (!phoneRegex.test(editedData.phone)) {
                notifyError("Số điện thoại phải có từ 10 đến 11 số.");
                isValid = false;
            }
        }

        if (isValid) {
            const formData = new FormData();
            formData.append("profileImage", profileImage); // Thêm hình ảnh vào form data
            formData.append("name", editedData.name);
            formData.append("email", editedData.email);
            formData.append("fullName", editedData.fullName);
            formData.append("phone", editedData.phone);
            formData.append("address", editedData.address);
            Object.keys(editedData).forEach(key => {
                formData.append(key, editedData[key]);
            });
            if (profileImage) {
                formData.append("profileImage", profileImage); 
            }
            try {
                const response = await api.put('/Users/profile', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setUserData(response.data);
                setImageUrl(response.data.profileImageUrl);
                setIsEditing(false);
                setSuccess("Cập nhật thành công!");
                setError(null);
                setTimeout(() => setSuccess(null), 3000);
            } catch (error) {
                console.error("Error updating user data:", error);
                setError("Cập nhật thất bại! Vui lòng thử lại sau.");
                setSuccess(null);
            }
        }
    };

    if (!userData) {
        return (
        <div>Loading...</div>
        );
    }
    const userId = userData.userId;
    return (
        <>
        <Notification />
            <Header />
            <div className="bg-slate-100 p-20">
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center mb-4" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative text-center mb-4" role="alert">
                        <span className="block sm:inline">{success}</span>
                    </div>
                )}
                <div className="flex max-w-6xl mx-auto">
                    <div className="w-1/4 bg-white shadow-md rounded-lg p-5">
                    <div className="text-center mb-5">
                        <img 
                             src={isEditing && profileImage ? URL.createObjectURL(profileImage) : imageUrl}
                            alt={userData.name} 
                            className="w-24 h-24 rounded-full mx-auto mb-2" 
                        />
                        {isEditing && (
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                className="mt-3 p-2 border rounded"
                            />
                        )}
                        <h2 className="text-xl font-semibold mt-2">{userData.name}</h2>
                        <p className="text-gray-600">{userData.email}</p>
                        
                    </div>
                        <nav class="space-y-2">
                            <Link className="block text-gray-700 hover:bg-gray-200 p-2 rounded">Thông tin</Link>
                            <Link className="block text-gray-700 hover:bg-gray-200 p-2 rounded">Danh sách đơn hàng</Link>
                            <Link className="block text-gray-700 hover:bg-gray-200 p-2 rounded">Đổi mật khẩu</Link>
                            {userType === 'Seller' && (
                                <Link
                                    to={`/personal-product/${userId}`}
                                    className="block text-gray-700 hover:bg-gray-200 p-2 rounded"
                                >
                                    Quản lí Shop
                                </Link>
                            )}
                            {userType === 'Buyer' && (
                                <Link
                                    to="/register-seller"
                                    className="block text-gray-700 hover:bg-gray-200 p-2 rounded"
                                >
                                    Đăng ký làm người bán
                                </Link>
                            )}
                            <Link className="block text-gray-700 hover:bg-gray-200 p-2 rounded" onClick={handleLogout}>Đăng xuất</Link>
                        </nav>
                    </div>
                    <div className="flex-1 bg-white shadow-md rounded-lg p-5 ml-5">
                        <h1 className="text-center text-2xl font-bold mb-5">Thông tin tài khoản</h1>
                        <div className="flex mb-3 gap-4">
                            <h2 className="text-2xl p-2">Tên đăng nhập:</h2>
                            <p className="p-2">{userData.name}</p>
                        </div>
                        <div className="flex mb-3 gap-10">
                            <h2 className="text-2xl p-2">Tên đầy đủ:</h2>
                            <p className="text-lg">{isEditing ? (
                                <input
                                    type="text"
                                    name="fullName"
                                    value={editedData.fullName}
                                    onChange={handleChange}
                                    className="text-2xl w-full p-2 border rounded"
                                />
                            ) : (
                                <p className="text-2xl p-2">{userData.fullName}</p>
                            )}</p>
                        </div>

                        <div className="flex mb-3 gap-10">
                            <h2 className="text-2xl p-2">Email:</h2>
                            <p className="text-lg">{isEditing ? (
                                <input
                                    type="email"
                                    name="email"
                                    value={editedData.email}
                                    onChange={handleChange}
                                    className="text-2xl w-full p-2 border rounded"
                                />
                            ) : (
                                <p className="p-2 text-2xl">{userData.email}</p>
                            )}</p>
                        </div>
                        <div className="flex mb-3 gap-10">
                            <h2 className="text-2xl p-2">Số điện thoại:</h2>
                            <p className="text-lg">{isEditing ? (
                                <input
                                    type="tel"
                                    name="phone"
                                    value={editedData.phone}
                                    onChange={handleChange}
                                    className="text-2xl w-full p-2 border rounded"
                                />
                            ) : (
                                <p className="p-2 text-2xl">{userData.phone}</p>
                            )}</p>
                        </div>
                        <div className="flex mb-3 gap-10">
                            <h2 className="text-2xl p-2">Địa chỉ:</h2>
                            <p className="text-lg">{isEditing ? (
                                <input
                                    type="text"
                                    name="address"
                                    value={editedData.address}
                                    onChange={handleChange}
                                    className="text-2xl w-full p-2 border rounded"
                                />
                            ) : (
                                <p className="p-2 text-2xl">{userData.address}</p>
                            )}</p>
                        </div>
                        <div className="">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Lưu</button>
                                    <button onClick={handleCancel} className="bg-gray-300 text-black px-4 py-2 rounded">Hủy</button>
                                </>
                            ) : (
                                <button onClick={handleEdit} className="bg-green-500 text-white px-4 py-2 rounded">Chỉnh sửa hồ sơ</button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;