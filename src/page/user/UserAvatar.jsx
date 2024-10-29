import React, { useState } from 'react';
import { baseUrl } from "../../config/axios";
import PropTypes from 'prop-types';

const UserAvatar = ({ 
  userId, 
  userName, 
  size = 'medium', 
  className = '',
  showStatus = false,
  status = 'offline' // 'online', 'offline', 'away'
}) => {
  const [imageError, setImageError] = useState(false);

  // Định nghĩa kích thước
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    medium: 'w-10 h-10 text-base',
    large: 'w-16 h-16 text-xl',
    xlarge: 'w-24 h-24 text-3xl'
  };

  // Định nghĩa màu status
  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-500',
    away: 'bg-yellow-500'
  };

  const handleImageError = () => {
    console.error("Avatar load error for user:", userId);
    setImageError(true);
  };

  // Tạo fallback avatar với chữ cái đầu
  const renderFallbackAvatar = () => {
    const initial = userName ? userName.charAt(0).toUpperCase() : '?';
    const bgColors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500'
    ];
    // Chọn màu dựa trên tên người dùng
    const colorIndex = userName ? userName.length % bgColors.length : 0;
    
    return (
      <div className={`
        ${sizeClasses[size]} 
        ${bgColors[colorIndex]}
        rounded-full 
        flex 
        items-center 
        justify-center 
        text-white 
        font-bold
        shadow-sm
        ${className}
      `}>
        {initial}
      </div>
    );
  };

  // Component chính
  return (
    <div className="relative inline-block">
      {imageError || !userId ? (
        renderFallbackAvatar()
      ) : (
        <img
          src={`${baseUrl}Users/profile-image/${userId}?${new Date().getTime()}`}
          alt={userName || "User"}
          className={`
            ${sizeClasses[size]} 
            rounded-full 
            object-cover 
            shadow-sm
            border-2 
            border-white 
            hover:opacity-90 
            transition-opacity 
            duration-300
            ${className}
          `}
          onError={handleImageError}
        />
      )}
      
      {/* Status indicator */}
      {showStatus && (
        <span className={`
          absolute 
          bottom-0 
          right-0 
          w-3 
          h-3 
          rounded-full 
          border-2 
          border-white
          ${statusColors[status]}
        `}/>
      )}
    </div>
  );
};

// PropTypes cho type checking
UserAvatar.propTypes = {
  userId: PropTypes.number,
  userName: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xlarge']),
  className: PropTypes.string,
  showStatus: PropTypes.bool,
  status: PropTypes.oneOf(['online', 'offline', 'away'])
};

export default UserAvatar;
