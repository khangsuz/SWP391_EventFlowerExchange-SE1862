import { useEffect, useState } from "react";
import Header from "../../component/header";
import "../../index.css";
import api from "../../config/axios";

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedData, setEditedData] = useState({});
    const [success, setSuccess] = useState(null);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/Users/profile');
            setUserData(response.data);
            setEditedData(response.data);
        } catch (error) {
            console.error("Error fetching user data:", error);
            setError("Failed to load user data. Please try again later.");
        }
    };
    
    useEffect(() => {
        fetchUserData();
    }, []);

    const handleEdit = () => {
        setIsEditing(true);
        setError(null);
        setSuccess(null);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setEditedData(userData);
        setError(null);
        setSuccess(null);
    };

    const handleChange = (e) => {
        setEditedData({ ...editedData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const response = await api.put('/Users/profile', editedData);
            setUserData(response.data);
            setIsEditing(false);
            setSuccess("Profile updated successfully!");
            setError(null);
            setTimeout(() => setSuccess(null), 3000); // Clear success message after 3 seconds
        } catch (error) {
            console.error("Error updating user data:", error);
            setError("Failed to update user data. Please try again.");
            setSuccess(null);
        }
    };

    if (!userData) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Header />
            <div>
                <h1 className="font-meri text-center text-3xl mt-10 mb-5">
                    Thông tin tài khoản
                </h1>
            </div>
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
            <div className="bg-white overflow-hidden shadow rounded-lg border mtfixed flex justify-center">
                <div className="flex flex-col sm:flex-row">
                    <div className="p-4">
                        <img
                            src="https://i.postimg.cc/pyNqGCzg/Githubjpg.png"
                            alt="User Profile"
                            className="rounded-full h-20 w-20 object-cover"
                        />
                    </div>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                    <dl className="sm:divide-y sm:divide-gray-200">
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="flex text-center font-medium text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                                Tên
                            </dt>
                            <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={editedData.name}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                ) : (
                                    userData.name
                                )}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="flex text-center font-medium text-gray-500 space">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                                Email
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {isEditing ? (
                                    <input
                                        type="email"
                                        name="email"
                                        value={editedData.email}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                ) : (
                                    userData.email
                                )}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="flex text-center font-medium text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                                </svg>
                                Số Điện Thoại
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={editedData.phone}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                ) : (
                                    userData.phone
                                )}
                            </dd>
                        </div>
                        <div className="py-3 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="mr-1 inline-block h-6 w-6 size-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                                </svg>
                                Địa chỉ
                            </dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        name="address"
                                        value={editedData.address}
                                        onChange={handleChange}
                                        className="w-full p-2 border rounded"
                                    />
                                ) : (
                                    userData.address
                                )}
                            </dd>
                        </div>
                    </dl>
                </div>
            </div>
            <div className="mt-4 flex justify-center">
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
    );
};

export default Profile;