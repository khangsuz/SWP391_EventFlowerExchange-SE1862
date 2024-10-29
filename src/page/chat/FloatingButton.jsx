// src/components/FloatingChatButton.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FloatingChatButton = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7288/api/Chat/unread-count', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  if (!user) return null;

  return (
    <button
      onClick={() => navigate('/chat')}
      className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 rounded-full shadow-lg 
        hover:bg-blue-600 transition-all duration-200 flex items-center justify-center 
        group hover:scale-110 active:scale-95 z-50"
    >
      {/* Chat Icon */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-7 w-7 text-white" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" 
        />
      </svg>

      {/* Unread Count Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs 
          w-5 h-5 rounded-full flex items-center justify-center">
          {unreadCount}
        </span>
      )}

      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-gray-800 text-white text-sm py-1 px-2 
        rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
        Tin nhắn {unreadCount > 0 ? `(${unreadCount})` : ''}
      </span>
    </button>
  );
};

export default FloatingChatButton;