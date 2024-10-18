import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import axios from 'axios';

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
    const token = localStorage.getItem("token");

    if (!user || !token) {
      setError("Vui lòng đăng nhập để sử dụng chat");
      return;
    }
    setCurrentUser(user);

    if (!conversationId || isNaN(parseInt(conversationId))) {
      setError("ConversationId không hợp lệ");
      return;
    }

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7288/chathub", { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    newConnection.start()
      .then(() => {
        console.log('Connected to SignalR hub');
        setConnection(newConnection);
        return newConnection.invoke("JoinConversation", conversationId.toString());
      })
      .then(() => loadChatHistory())
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
      connection.on('ReceiveMessage', (userId, userName, messageContent, msgConversationId) => {
        if (msgConversationId.toString() === conversationId) {
          setMessages(prevMessages => [...prevMessages, { userId, userName, messageContent, sendTime: new Date() }]);
          scrollToBottom();
        }
      });
      connection.on('SendMessageError', (errorMessage) => setError(errorMessage));
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
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.data.message) {
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
      handleErrorResponse(error);
    }
  };

  const sendMessage = async () => {
    if (isSending || !connection || connection.state !== signalR.HubConnectionState.Connected || message.trim() === '') return;

    setIsSending(true);
    try {
      await connection.invoke('SendMessage', parseInt(currentUser.userId), message, parseInt(conversationId));
      setMessage("");
    } catch (e) {
      handleErrorResponse(e);
    } finally {
      setIsSending(false);
    }
  };

  const handleErrorResponse = (error) => {
    if (error.response && error.response.status === 401) {
      setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
    } else if (error.response && error.response.status === 404) {
      setError("Cuộc trò chuyện không tồn tại.");
    } else {
      setError("Không thể tải lịch sử chat. Vui lòng thử lại sau.");
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  if (error) return <div className="error-message">{error}</div>;
  if (!currentUser) return <div>Vui lòng đăng nhập để chat</div>;

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Chat</h2>
      <div className="chat-window h-64 overflow-y-auto mb-4">
        {hasMore && (
          <button onClick={loadChatHistory} className="w-full text-blue-500 hover:text-blue-700">
            Tải thêm tin nhắn cũ
          </button>
        )}
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div key={index} className={`mb-2 ${parseInt(msg.userId) === parseInt(currentUser.userId) ? 'text-right' : 'text-left'}`}>
              <span className="text-xs text-gray-500">{msg.userName}</span>
              <span className={`inline-block p-2 rounded-lg ${parseInt(msg.userId) === parseInt(currentUser.userId) ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}>
                {msg.messageContent}
              </span>
              <span className="text-xs text-gray-500 block">
                {new Date(msg.sendTime).toLocaleTimeString()}
              </span>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">Cuộc trò chuyện chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!</div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="flex">
        <input
          type="text"
          className="flex-grow p-2 border border-gray-300 rounded-l"
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && sendMessage()}
          placeholder="Nhập tin nhắn..."
        />
        <button
          onClick={sendMessage}
          disabled={isSending}
          className={`bg-blue-500 text-white p-2 rounded-r hover:bg-blue-600 transition duration-200 ${isSending ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSending ? 'Đang gửi...' : 'Gửi'}
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
