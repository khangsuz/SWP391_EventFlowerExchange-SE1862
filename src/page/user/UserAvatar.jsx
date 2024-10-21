import React, { useState } from 'react';
import { baseUrl } from "../../config/axios";

const UserAvatar = ({ userId, userName }) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    console.error("Avatar load error for user:", userId);
    setImageError(true);
  };

  if (imageError || !userId) {
    const initial = userName ? userName.charAt(0).toUpperCase() : '?';
    return (
      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
        {initial}
      </div>
    );
  }

  return (
    <img
      src={`${baseUrl}Users/profile-image/${userId}?${new Date().getTime()}`}
      alt={userName || "User"}
      className="w-10 h-10 rounded-full object-cover"
      onError={handleImageError}
    />
  );
};

export default UserAvatar;