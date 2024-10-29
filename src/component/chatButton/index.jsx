// src/components/ChatButton.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const ChatButton = ({ sellerId }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleStartChat = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));

      if (!token || !user) {
        alert('Vui lòng đăng nhập để chat');
        return;
      }

      // Kiểm tra không cho chat với chính mình
      if (user.userId === sellerId) {
        alert('Không thể chat với chính mình');
        return;
      }

      const response = await axios.post(
        'https://localhost:7288/api/Chat/create',
        { sellerId: parseInt(sellerId) },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        navigate(`/chat/${response.data.conversationId}`);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      if (error.response?.status === 400) {
        alert(error.response.data.message);
      } else if (error.response?.status === 401) {
        alert('Vui lòng đăng nhập để chat');
      } else if (error.response?.status === 404) {
        alert('Không tìm thấy người dùng');
      } else {
        alert('Có lỗi xảy ra khi tạo cuộc trò chuyện');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Chỉ ẩn nút khi user là chính người bán đó
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.userId === sellerId) {
    return null;
  }

  return (
    <button
      onClick={handleStartChat}
      disabled={isLoading}
      className={`px-4 py-2 bg-blue-600 text-white rounded-lg
        transition-colors duration-200 flex items-center space-x-2
        ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Đang tạo...</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          <span>Nhắn tin</span>
        </>
      )}
    </button>
  );
};

export default ChatButton;
