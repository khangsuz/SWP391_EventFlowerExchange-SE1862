import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import UserAvatar from '../user/UserAvatar';
import { Loader2 } from 'lucide-react';
import { format, parseISO, isToday } from 'date-fns';
import { vi } from 'date-fns/locale';

const ConversationList = ({ activeConversationId, onConversationSelect }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUser = JSON.parse(localStorage.getItem('user'));

  const loadConversations = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `https://localhost:7288/api/Conversation/User/${currentUser.userId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError('Không thể tải danh sách cuộc trò chuyện');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.userId]);

  // Chỉ load conversations một lần khi component mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]); // Bỏ activeConversationId ra khỏi dependencies

  const formatMessageTime = (dateString) => {
    try {
      const date = parseISO(dateString);
      
      if (isToday(date)) {
        return format(date, 'HH:mm', { locale: vi });
      }
      
      return format(date, 'dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Không xác định';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {conversations.map((conv) => {
        const otherUser = currentUser.userId === conv.seller.userId 
          ? conv.buyer 
          : conv.seller;

        const isActive = conv.conversationId === parseInt(activeConversationId);

        return (
          <div
            key={conv.conversationId}
            onClick={() => {
              if (!isActive) {
                onConversationSelect(conv.conversationId);
              }
            }}
            className={`
              flex items-center p-3 rounded-lg transition-colors duration-200 cursor-pointer
              ${isActive 
                ? 'bg-blue-50 border border-blue-200' 
                : 'hover:bg-gray-50'}
            `}
          >
            <UserAvatar
              userId={otherUser.userId}
              userName={otherUser.fullName}
              size="medium"
              className="flex-shrink-0 mr-3"
            />
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h3 className="font-medium text-gray-900 truncate">
                  {otherUser.fullName}
                </h3>
                {conv.lastMessage && (
                  <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                    {formatMessageTime(conv.lastMessage.sendTime)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {conv.lastMessage && (
                  <p className="text-sm text-gray-500 truncate">
                    {conv.lastMessage.messageContent}
                  </p>
                )}
                {conv.lastMessage?.isCustomOrder && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 flex-shrink-0">
                    Đơn hàng tùy chỉnh
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
      {conversations.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Chưa có cuộc trò chuyện nào
        </div>
      )}
    </div>
  );
};

export default ConversationList;
