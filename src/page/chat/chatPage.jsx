import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatBox from './ChatBox';
import ConversationList from './ConversationList';
import Header from '../../component/header';
import Footer from '../../component/footer';
import { Loader2 } from 'lucide-react';

const ChatPage = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const user = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!user || !token) {
        navigate('/login');
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleConversationSelect = useCallback((id) => {
    navigate(`/chat/${id}`);
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          <div className="w-1/3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
              <h2 className="text-xl font-semibold mb-4">Tin nhắn</h2>
              <ConversationList 
                activeConversationId={conversationId} 
                onConversationSelect={handleConversationSelect}
              />
            </div>
          </div>

          <div className="w-2/3">
            {conversationId ? (
              <ChatBox 
                key={conversationId} 
                conversationId={conversationId}
              />
            ) : (
              <div className="h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center">
                <p className="text-gray-500 font-bold">Chọn một cuộc trò chuyện để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ChatPage;
