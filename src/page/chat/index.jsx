import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const ChatBox = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    console.log(user);
    if (user) {
      setCurrentUser(user);
    }
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Vui lòng đăng nhập để sử dụng chat");
      return;
    }

    if (!conversationId || isNaN(parseInt(conversationId))) {
      setError("ConversationId không hợp lệ");
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7288/chathub", {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.start()
      .then(() => {
        console.log('Connected to SignalR hub');
        setConnection(newConnection);
        return newConnection.invoke("JoinConversation", conversationId.toString());
      })
      .then(() => {
        console.log('Joined conversation:', conversationId);
        loadChatHistory();
      })
      .catch(e => {
        console.error('Error during connection or joining conversation:', e);
        setError("Không thể kết nối đến server chat hoặc tham gia cuộc trò chuyện");
      });

    return () => {
      if (newConnection && newConnection.state === signalR.HubConnectionState.Connected) {
        newConnection.invoke("LeaveConversation", conversationId.toString());
        newConnection.stop();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    if (connection) {
      connection.on('ReceiveMessage', (userId, fullName, messageContent, msgConversationId) => {
        if (msgConversationId.toString() === conversationId) {
          setMessages(prevMessages => [...prevMessages, { userId, fullName, messageContent, sendTime: new Date() }]);
          scrollToBottom();
        }
      });

      connection.on('SendMessageError', (errorMessage) => {
        setError(errorMessage);
      });

      connection.onclose((error) => {
        console.error('Connection closed:', error);
        setError("Kết nối đã bị đóng. Vui lòng tải lại trang.");
      });
    }
  }, [connection, conversationId]);

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`https://localhost:7288/api/Chat/history/${conversationId}?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.message) {
        console.log(response.data.message);
        setMessages([]);
        setHasMore(false);
      } else {
        setMessages(prevMessages => [...response.data, ...prevMessages]);
        setPage(prevPage => prevPage + 1);
        setHasMore(response.data.length > 0);
      }
      scrollToBottom();
    } catch (error) {
      console.error("Failed to load chat history", error);
      if (error.response && error.response.status === 401) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response && error.response.status === 404) {
        setError("Cuộc trò chuyện không tồn tại.");
      } else {
        setError("Không thể tải lịch sử chat. Vui lòng thử lại sau.");
      }
    }
  };

  const sendMessage = async () => {
    if (isSending || !connection || connection.state !== signalR.HubConnectionState.Connected || message.trim() === '') {
      return;
    }
    setIsSending(true);
    try {
      await connection.invoke('SendMessage', parseInt(currentUser.userId), message, parseInt(conversationId));
      setMessage("");
    } catch (e) {
      console.error('Error sending message:', e);
      if (e.message.includes('Unauthorized')) {
        setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      } else {
        setError(`Không thể gửi tin nhắn. Lỗi: ${e.message}`);
      }
    } finally {
      setIsSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
        {error}
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-600 text-center">
        Vui lòng đăng nhập để chat
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          {currentUser ? currentUser.fullName : 'Người dùng không xác định'}
        </h2>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {hasMore && (
          <button 
            onClick={loadChatHistory} 
            className="w-full py-2 text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            Tải thêm tin nhắn cũ
          </button>
        )}
        
        {messages.length > 0 ? (
          messages.map((msg, index) => {
            const isCurrentUser = parseInt(msg.userId) === parseInt(currentUser.userId);
            return (
              <div key={index} className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-gray-500 mb-1">{msg.fullName}</span>
                <div className={`max-w-[80%] break-words ${
                  isCurrentUser 
                    ? 'bg-blue-600 text-white rounded-t-2xl rounded-bl-2xl' 
                    : 'bg-gray-100 text-gray-800 rounded-t-2xl rounded-br-2xl'
                } px-4 py-2`}>
                  {msg.messageContent}
                </div>
                <span className="text-xs text-gray-400 mt-1">
                  {new Date(msg.sendTime).toLocaleTimeString()}
                </span>
              </div>
            );
          })
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              Cuộc trò chuyện chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
            </p>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
            placeholder="Nhập tin nhắn..."
          />
          <button
            onClick={sendMessage}
            disabled={isSending}
            className={`px-6 py-2 bg-blue-600 text-white rounded-lg font-medium transition-all duration-200
              ${isSending 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-blue-700 active:scale-95'
              }`}
          >
            {isSending ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang gửi...</span>
              </div>
            ) : (
              'Gửi'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;