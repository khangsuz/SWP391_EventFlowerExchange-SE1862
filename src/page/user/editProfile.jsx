import { useEffect, useState } from "react";
import { Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import Header from "../../component/header";
import "../../index.css";
import Footer from "../../component/footer";
import { useCart } from "../../contexts/CartContext";
import RegisterSeller from "./RegisterSeller";
import OrderHistory from "./OrderHistory";
import ChangePassword from "./ChangePassword";
import api, { baseUrl } from "../../config/axios";
import LoadingComponent from "../../component/loading";

const Profile = () => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userType, setUserType] = useState(null);
    const [editedData, setEditedData] = useState({});
    const [success, setSuccess] = useState(null);
    const { updateCartItemCount } = useCart();
    const [profileImage, setProfileImage] = useState(null);
    const location = useLocation();
    const [imageKey, setImageKey] = useState(0);
    const [imageError, setImageError] = useState(false);

    const fetchUserData = async () => {
        setLoading(true);
        try {
            const response = await api.get('/Users/profile');
            setUserData(response.data);
            setEditedData(response.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load user data. Please try again later.");
        } finally {
            setLoading(false);
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
        localStorage.setItem('cart', JSON.stringify([]));
        updateCartItemCount();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('cart');
        clearCart();
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
        setImageError(false); // Reset image error when cancelling edit
        URL.revokeObjectURL(editedData.profileImageUrl);
      };

    const handleChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
          setProfileImage(file);
          setEditedData({ ...editedData, profileImage: file });
          setImageError(false); // Reset image error when a new image is selected
        }
      };

      const handleSave = async () => {
        setLoading(true);
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
                alert("Email không hợp lệ.");
                isValid = false;
            }
        }

        if (editedData.phone !== userData.phone) {
            const phoneRegex = /^\d{10,11}$/;
            if (!phoneRegex.test(editedData.phone)) {
                alert("Số điện thoại phải có từ 10 đến 11 số.");
                isValid = false;
            }
        }

        if (isValid) {
            const formData = new FormData();
            Object.keys(editedData).forEach(key => {
                if (key !== 'profileImageUrl') {
                    formData.append(key, editedData[key]);
                }
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
                await fetchUserData(); // Tải lại dữ liệu người dùng
                setIsEditing(false);
                setSuccess("Profile updated successfully!");
                setError(null);
                setProfileImage(null);
                setImageKey(prev => prev + 1); // Force re-render of image
                setTimeout(() => setSuccess(null), 3000);
            } catch (error) {
                console.error("Error updating user data:", error);
                setError("Failed to update user data. Please try again.");
                setSuccess(null);
            }
        }
        setLoading(false);
    };

    if (!userData) {
        return <LoadingComponent />;
    }
    const userId = userData.userId;
    return (
        <>
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
                            {!imageError ? (
                                <img
                                    key={imageKey}
                                    src={isEditing && profileImage
                                        ? URL.createObjectURL(profileImage)
                                        : (userData.profileImageUrl
                                            ? `${baseUrl}Users/profile-image/${userData.userId}?${new Date().getTime()}`
                                            : '/path/to/default/image.jpg')}
                                    alt={userData.name}
                                    className="w-24 h-24 rounded-full mx-auto mb-2 object-cover"
                                    onError={(e) => {
                                        console.error("Image load error:", e);
                                        setImageError(true);
                                    }}
                                />
                            ) : (
                                <div className="w-24 h-24 rounded-full mx-auto mb-2 bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
                                    {userData.fullName ? userData.fullName.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            {isEditing && (
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="mt-3 w-full p-2 border rounded"
                                />
                            )}
                            <h2 className="text-xl font-semibold mt-2">{userData.fullName}</h2>
                            <p className="text-gray-600">{userData.email}</p>
                        </div>
                        <nav className="space-y-2">
                            <Link
                                to="/profile"
                                className={`block p-2 rounded ${location.pathname === '/profile' ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                Thông tin
                            </Link>
                            <Link
                                to="/profile/order-history"
                                className={`block p-2 rounded ${location.pathname === '/profile/order-history' ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                Danh sách đơn hàng
                            </Link>
                            <Link
                                to="/profile/change-password"
                                className={`block p-2 rounded ${location.pathname === '/profile/change-password' ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                            >
                                Đổi mật khẩu
                            </Link>
                            {userType === 'Seller' && (
                                <Link
                                    to={`/personal-product/${userId}`}
                                    className={`block p-2 rounded ${location.pathname === `/personal-product/${userId}` ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Quản lí Shop
                                </Link>
                            )}
                            {userType === 'Buyer' && (
                                <Link
                                    to="/profile/register-seller"
                                    className={`block p-2 rounded ${location.pathname === '/profile/register-seller' ? 'bg-gray-200' : 'text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Đăng ký làm người bán
                                </Link>
                            )}
                            <button
                                className="block text-gray-700 hover:bg-gray-200 p-2 rounded w-full text-left"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </nav>
                    </div>
                    <div className="flex-1 bg-white shadow-md rounded-lg p-5 ml-5">
                        <Routes>
                            <Route path="/" element={
                                <>
                                    <h1 className="text-center text-2xl font-semibold mb-5 mt-8">Thông tin tài khoản</h1>
                                    <div className="flex mb-3">
                                        <h2 className="text-2xl p-2 w-56">Tên đầy đủ:</h2>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={editedData.fullName}
                                                onChange={handleChange}
                                                className="text-2xl p-2 border rounded"
                                            />
                                        ) : (
                                            <p className="p-2 text-2xl">{userData.fullName}</p>
                                        )}
                                    </div>
                                    <div className="flex mb-3">
                                        <h2 className="text-2xl p-2 w-56">Email:</h2>
                                        {isEditing ? (
                                            <input
                                                type="email"
                                                name="email"
                                                value={editedData.email}
                                                onChange={handleChange}
                                                className="text-2xl p-2 border rounded"
                                            />
                                        ) : (
                                            <p className="p-2 text-2xl">{userData.email}</p>
                                        )}
                                    </div>
                                    <div className="flex mb-3">
                                        <h2 className="text-2xl p-2 w-56">Số điện thoại:</h2>
                                        {isEditing ? (
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={editedData.phone}
                                                onChange={handleChange}
                                                className="text-2xl p-2 border rounded"
                                            />
                                        ) : (
                                            <p className="p-2 text-2xl">{userData.phone}</p>
                                        )}
                                    </div>
                                    <div className="flex mb-3">
                                        <h2 className="text-2xl p-2 w-56">Địa chỉ:</h2>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                name="address"
                                                value={editedData.address}
                                                onChange={handleChange}
                                                className="text-2xl p-2 border rounded"
                                            />
                                        ) : (
                                            <p className="p-2 text-2xl">{userData.address}</p>
                                        )}
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
                                </>
                            } />
                            <Route path="change-password" element={<ChangePassword />} />
                            <Route path="register-seller" element={<RegisterSeller userData={userData} />} />
                            <Route path="order-history" element={<OrderHistory />} />
                        </Routes>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Profile;