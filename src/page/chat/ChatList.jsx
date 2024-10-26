// src/pages/chat/ChatList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import UserAvatar from '../../components/UserAvatar';

const ChatList = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://localhost:7288/api/Chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setConversations(response.data);
    } catch (error) {
      setError('Không thể tải danh sách chat');
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (conversation) => {
    if (currentUser.userId === conversation.seller.userId) {
      return conversation.buyer;
    }
    return conversation.seller;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Tin nhắn của tôi</h1>
      <div className="space-y-4">
        {conversations.length > 0 ? (
          conversations.map(conversation => {
            const otherUser = getOtherUser(conversation);
            const lastMessage = conversation.lastMessage;

            return (
              <Link
                key={conversation.conversationId}
                to={`/chat/${conversation.conversationId}`}
                className="block"
              >
                <div className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-4">
                    <UserAvatar
                      userId={otherUser.userId}
                      userName={otherUser.name}
                      avatarUrl={otherUser.avatar}
                      size="large"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-800">
                          {otherUser.name}
                        </h3>
                        {lastMessage && (
                          <span className="text-sm text-gray-500">
                            {format(new Date(lastMessage.sendTime), 'HH:mm dd/MM/yyyy', { locale: vi })}
                          </span>
                        )}
                      </div>
                      {lastMessage && (
                        <p className="text-gray-600 text-sm line-clamp-1">
                          {lastMessage.messageContent}
                        </p>
                      )}
                      {!lastMessage && (
                        <p className="text-gray-500 text-sm italic">
                          Chưa có tin nhắn
                        </p>
                      )}
                      {lastMessage && !lastMessage.isRead && lastMessage.senderId !== currentUser.userId && (
                        <div className="mt-1">
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Mới
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="text-center text-gray-500 py-8">
            Chưa có cuộc trò chuyện nào
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;