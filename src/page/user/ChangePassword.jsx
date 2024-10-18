import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../component/header';
import Footer from '../../component/footer';
import api from '../../config/axios';

const ChangePassword = () => {
    const navigate = useNavigate();
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const validatePassword = (password) => {
        return password.length >= 5;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
    
        if (!validatePassword(passwords.newPassword)) {
            setError('Mật khẩu mới phải có ít nhất 5 ký tự.');
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Mật khẩu mới và xác nhận mật khẩu không khớp.');
            return;
        }
    
        try {
            const response = await api.post('/Users/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
                confirmPassword: passwords.confirmPassword
            });
            setSuccess('Đổi mật khẩu thành công!');
            setTimeout(() => navigate('/profile'), 2000);
        } catch (err) {
            setError(err.response?.data || 'Có lỗi xảy ra khi đổi mật khẩu.');
        }
    };

    return (
        <>
            <Header />
            <div className="bg-slate-100 p-20">
                <div className="max-w-md mx-auto bg-white shadow-md rounded-lg p-6">
                    <h1 className="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h1>
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                            <span className="block sm:inline">{success}</span>
                        </div>
                    )}
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label htmlFor="currentPassword" className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu hiện tại</label>
                            <input
                                type="password"
                                id="currentPassword"
                                name="currentPassword"
                                value={passwords.currentPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="newPassword" className="block text-gray-700 text-sm font-bold mb-2">Mật khẩu mới</label>
                            <input
                                type="password"
                                id="newPassword"
                                name="newPassword"
                                value={passwords.newPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                                minLength={5}
                            />
                        </div>
                        <div className="mb-6">
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Xác nhận mật khẩu mới</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={passwords.confirmPassword}
                                onChange={handleChange}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                required
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Đổi mật khẩu
                            </button>
                            <button type="button" onClick={() => navigate('/profile')} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ChangePassword;