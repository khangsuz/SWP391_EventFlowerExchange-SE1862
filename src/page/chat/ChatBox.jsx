import React, { useState, useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import api from "../../config/axios";
import { Loader2 } from 'lucide-react';
import UserAvatar from '../user/UserAvatar';
import { getFullImageUrl } from '../../utils/imageHelpers';
import { format, parseISO, isToday, addHours } from 'date-fns';
import { vi } from 'date-fns/locale';
import CreateOrderForm from '../../component/createOrder';
import { Button, message as antMessage } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const ChatHeader = ({ currentUser, sellerInfo, buyerInfo, onOpenModal }) => {
  // Xác định người đối thoại dựa trên currentUser
  const getPartnerInfo = () => {
    if (!currentUser || !sellerInfo || !buyerInfo) return null;

    // Nếu currentUser là seller, hiển thị thông tin buyer
    if (currentUser.userId === sellerInfo.seller?.userId) {
      return {
        name: buyerInfo.fullName || "Người mua",
        avatar: buyerInfo.avatar,
        role: "Người mua",
        userId: buyerInfo.buyerId
      };
    }
    
    // Nếu currentUser là buyer, hiển thị thông tin seller
    else {
      return {
        name: sellerInfo.seller?.fullName || "Người bán",
        avatar: sellerInfo.seller?.avatar,
        role: "Người bán",
        userId: sellerInfo.seller?.userId
      };
    }
  };

  const partnerInfo = getPartnerInfo();

  if (!partnerInfo) return null;

  return (
    <div className="px-6 py-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <UserAvatar
            userId={partnerInfo.userId}
            userName={partnerInfo.name}
            avatarUrl={partnerInfo.avatar}
            size="large"
          />
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              {partnerInfo.name}
            </h2>
            <p className="text-sm text-gray-500">{partnerInfo.role}</p>
          </div>
        </div>

        {/* Nút tạo đơn hàng - chỉ hiển thị khi người dùng hiện tại là seller */}
        {currentUser.userId === sellerInfo.seller?.userId && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenModal}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2 transition-all duration-200"
          >
            Tạo đơn hàng tùy chỉnh
          </Button>
        )}
      </div>
    </div>
  );
};

const ChatBox = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);
  const [message, setMessage] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);
  const [isSending, setIsSending] = useState(false);
  const [sellerInfo, setSellerInfo] = useState(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);
  const [buyerInfo, setBuyerInfo] = useState(null);
  const [isSeller, setIsSeller] = useState(false);
  const [isConversationSeller, setIsConversationSeller] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFlower, setSelectedFlower] = useState(null);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingMessages(true);
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
          setError("Vui lòng đăng nhập để sử dụng chat");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          setError("Vui lòng đăng nhập để sử dụng chat");
          return;
        }

        const response = await api.get(
          `Chat/history/${conversationId}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data) {
          const conversation = response.data.conversation;
          
          setSellerInfo({
            seller: {
              userId: conversation.seller.userId,
              fullName: conversation.seller.fullName,
              avatar: conversation.seller.avatar
            }
          });

          setBuyerInfo({
            buyerId: conversation.buyer.userId,
            fullName: conversation.buyer.fullName,
            avatar: conversation.buyer.avatar
          });

          const formattedMessages = response.data.messages.map(msg => {
            const isCurrentUser = msg.senderId === user.userId;
            return {
              ...msg,
              senderName: isCurrentUser 
                ? conversation.buyer.fullName 
                : conversation.seller.fullName,
              senderAvatar: isCurrentUser 
                ? conversation.buyer.avatar 
                : conversation.seller.avatar,
              imageUrl: msg.imageUrl ? getFullImageUrl(msg.imageUrl) : null,
              isCurrentUser
            };
          });

          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        handleError(error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadInitialData();
  }, [conversationId]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
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

    const setupConnection = async () => {
      try {
        const newConnection = new signalR.HubConnectionBuilder()
          .withUrl("https://localhost:7288/chathub", {
            accessTokenFactory: () => token
          })
          .withAutomaticReconnect()
          .configureLogging(signalR.LogLevel.Information)
          .build();

        newConnection.on('ReceiveMessage', (message) => {
          if (message.conversationId.toString() === conversationId.toString()) {
            const isCurrentUser = parseInt(message.senderId) === parseInt(user.userId);
            const newMessage = {
              messageId: message.messageId,
              senderId: message.senderId,
              senderName: isCurrentUser ? currentUser.fullName : message.senderName,
              senderAvatar: isCurrentUser ? currentUser.avatar : message.senderAvatar,
              messageContent: message.messageContent,
              imageUrl: message.imageUrl ? getFullImageUrl(message.imageUrl) : null,
              sendTime: message.sendTime.endsWith('Z') ? message.sendTime : message.sendTime + 'Z',
              isCurrentUser
            };

            setMessages(prevMessages => [...prevMessages, newMessage]);
            scrollToBottom();
          }
        });

        newConnection.onreconnecting((error) => {
          console.log('Reconnecting to SignalR hub...', error);
        });

        newConnection.onreconnected((connectionId) => {
          console.log('Reconnected to SignalR hub:', connectionId);
        });

        newConnection.onclose((error) => {
          console.error('Connection closed:', error);
          setError("Kết nối đã bị ng. Vui lòng tải lại trang.");
        });

        await newConnection.start();
        await newConnection.invoke("JoinConversation", conversationId.toString());
        setConnection(newConnection);
        await loadChatHistory();
      } catch (error) {
        console.error('Error during connection setup:', error);
        setError("Không thể kết nối đến server chat hoặc tham gia cuộc trò chuyện");
      }
    };

    setupConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      const scrollHeight = messagesContainerRef.current.scrollHeight;
      const height = messagesContainerRef.current.clientHeight;
      const maxScrollTop = scrollHeight - height;
      messagesContainerRef.current.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }
  };

  const loadChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get(
        `Chat/history/${conversationId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data) {
        const formattedMessages = response.data.messages.map(msg => ({
          ...msg,
          senderName: msg.senderId === currentUser?.userId ? currentUser.fullName : response.data.conversation?.sellerName,
          senderAvatar: msg.senderId === currentUser?.userId ? currentUser.avatar : response.data.conversation?.sellerAvatar,
          imageUrl: getFullImageUrl(msg.imageUrl)
        }));

        setSellerInfo(response.data.conversation);
        setMessages(prevMessages => [...formattedMessages]);
      }
    } catch (error) {
      console.error("Failed to load chat history", error);
      handleError(error);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const sendMessage = async () => {
    if (!connection) {
      console.error("No SignalR connection");
      alert('Không có kết ni, vui lòng tải lại trang');
      return;
    }

    if (connection.state !== signalR.HubConnectionState.Connected) {
      console.error("SignalR connection not in Connected state");
      alert('Đang kết nối lại, vui lòng thử lại sau');
      return;
    }

    if (!message.trim() && !selectedImage) {
      return;
    }

    setIsSending(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const formData = new FormData();
      formData.append('ConversationId', conversationId);

      if (message.trim()) {
        formData.append('MessageContent', message.trim());
      }

      if (selectedImage) {
        formData.append('Image', selectedImage);
      }

      const response = await api.post(
        'Chat/send',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          }
        }
      );

      if (response.data) {
        const newMessage = {
          ...response.data,
          senderName: currentUser?.fullName,
          senderAvatar: currentUser?.avatar,
          imageUrl: response.data.imageUrl ? getFullImageUrl(response.data.imageUrl) : null,
          isCurrentUser: true
        };

        setMessages(prevMessages => [...prevMessages, newMessage]);
        setMessage('');
        clearImage();

        scrollToBottom();
        if (isUserAtBottom()) {
          markAsRead();
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      let errorMessage = 'Có lỗi xảy ra khi gửi tin nhắn';

      if (error.response) {
        switch (error.response.status) {
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại';
            break;
          case 403:
            errorMessage = 'Bạn không có quyền gửi tin nhắn trong cuộc trò chuyện này';
            break;
          case 404:
            errorMessage = 'Không tìm thấy cuộc trò chuyện';
            break;
          default:
            errorMessage = `Lỗi: ${error.response.data?.message || 'Không xác định'}`;
        }
      }

      alert(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleError = (error) => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          setError("Phiên đăng nhập ã hết hạn. Vui lòng đăng nhập lại.");
          break;
        case 403:
          setError("Bạn không có quyền thc hiện hành động này.");
          break;
        case 404:
          setError("Cuộc trò chuyện không tồn tại.");
          break;
        default:
          setError("Có lỗi xảy ra. Vui lòng thử lại sau.");
      }
    } else {
      setError("Không thể kết nối đến server.");
    }
  };

  const isUserAtBottom = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      return scrollHeight - scrollTop === clientHeight;
    }
    return false;
  };  

  const markAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `https://localhost:7288/api/Chat/mark-as-read/${conversationId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
    } catch (error) {
      console.error("Failed to mark messages as read", error);
    }
  };

  const renderMessage = (msg) => {
    const isCurrentUser = msg.senderId === currentUser?.userId;
    
    let senderName, senderAvatar;
    if (isCurrentUser) {
      senderName = sellerInfo.buyer?.fullName;
      senderAvatar = sellerInfo.buyer?.avatar;
    } else {
      senderName = sellerInfo.seller?.fullName;
      senderAvatar = sellerInfo.seller?.avatar;
    }

    const formatMessageTime = (timeString) => {
      try {
        console.log('Original UTC time:', timeString);
        const isISOString = timeString.endsWith('Z');
        
        const utcDate = parseISO(timeString);
        console.log('Parsed UTC date:', utcDate);
        
        const localDate = isISOString 
          ? utcDate 
          : new Date(utcDate.getTime() + (7 * 60 * 60 * 1000));
        
        console.log('Local date:', localDate);
        console.log('Is ISO string:', isISOString);

        if (isToday(localDate)) {
          return format(localDate, 'HH:mm', { locale: vi });
        } else {
          return format(localDate, 'dd/MM/yyyy HH:mm', { locale: vi });
        }
      } catch (error) {
        console.error('Error formatting time:', error);
        return timeString;
      }
    };

    return (
      <div key={msg.messageId}
        className={`flex items-end space-x-2 mb-4 ${isCurrentUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}
      >
        <UserAvatar
          userId={msg.senderId}
          userName={senderName || "Unknown"}
          avatarUrl={senderAvatar}
          size="small"
          className="flex-shrink-0"
        />

        <div className={`flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'} max-w-[70%] gap-1`}>
          <span className="text-xs text-gray-500 px-2">
            {senderName || 'Unknown User'}
          </span>

          {/* Hin th ảnh riêng nếu có */}
          {msg.imageUrl && (
            <div className="relative mb-1">
              <img
                src={msg.imageUrl}
                alt="Chat"
                className="max-w-[300px] rounded-lg cursor-pointer hover:opacity-90 transition-opacity border-2 border-gray-900 shadow" // Tăng ộ dày viền và thêm shadow
                onClick={() => window.open(msg.imageUrl, '_blank')}
                onError={(e) => {
                  console.error("Image load error:", msg.imageUrl);
                  e.target.src = 'placeholder-image-url';
                }}
              />
            </div>
          )}

          {/* Hin th text riêng nếu có */}
          {msg.messageContent && (
            <div className={`
              break-words rounded-2xl px-4 py-2 shadow-sm
              ${isCurrentUser
                ? 'bg-[#e3f2fd] text-gray-800 rounded-br-none'
                : 'bg-[#e0f7fa] text-gray-800 rounded-bl-none'
              }
            `}>
              <p>{msg.messageContent}</p>
            </div>
          )}

          <span className="text-xs text-gray-400 px-2">
            {formatMessageTime(msg.sendTime)}
          </span>
        </div>
      </div>
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    const checkSellerStatus = () => {
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && sellerInfo) {
        const userIsSeller = user.userType === "Seller";
        const isConversationOwner = sellerInfo.seller && user.userId === sellerInfo.seller.userId;
        setIsSeller(userIsSeller);
        setIsConversationSeller(isConversationOwner);
      }
    };

    checkSellerStatus();
  }, [sellerInfo]);

  const handleCreateOrder = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      
      if (!payload.quantity || payload.quantity < 1) {
        antMessage.error('Số lượng không hợp lệ');
        return false;
      }

      const finalPayload = {
        flowerId: payload.flowerId,
        quantity: Math.floor(Number(payload.quantity)),
        price: Math.floor(Number(payload.price)),
        buyerId: payload.buyerId,
        isCustomOrder: true
      };

      console.log('Adding custom order to cart:', finalPayload);
      
      // Sử dụng Cart API endpoint
      const response = await api.post(
        'Cart/add-item',
        finalPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      if (response.data.success) {
        antMessage.success('Đã thêm vào giỏ hàng của người mua');
        setIsModalOpen(false);
        return true;
      } else {
        antMessage.error(response.data.message || 'Không thể thêm vào giỏ hàng');
        return false;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.data?.message) {
        antMessage.error(error.response.data.message);
      } else {
        antMessage.error('Không thể thêm vào giỏ hàng');
      }
      return false;
    }
  };

  // Sửa lại hàm sendMessageViaApi
  const sendMessageViaApi = async (content, conversationId) => {
    if (!conversationId) {
      console.error('ConversationId is missing');
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Tạo FormData
      const formData = new FormData();
      formData.append('conversationId', conversationId.toString());
      formData.append('messageContent', content);
      
      await api.post(
        'Chat/send',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
      antMessage.warning('Đã tạo đơn hàng thành công nhưng không thể gửi tin nhắn thông báo');
    }
  };

  console.log({
    isSeller,
    isConversationSeller,
    buyerInfo,
    sellerInfo
  });

  console.log('Modal state:', isModalOpen);

  useEffect(() => {
    console.log('Modal state changed:', isModalOpen);
  }, [isModalOpen]);

  const handleOpenModal = (flower) => {
    if (!buyerInfo?.buyerId || !sellerInfo?.seller?.userId) {
      antMessage.error('Thiếu thông tin người mua hoặc người bán');
      return;
    }
    setSelectedFlower(flower);
    setIsModalOpen(true);
  };

  useEffect(() => {
    if (buyerInfo || sellerInfo || selectedFlower) {
      console.log('Current values:', {
        buyerId: buyerInfo?.buyerId,
        sellerId: sellerInfo?.seller?.userId,
        flowerId: selectedFlower?.flowerId,
        flowerName: selectedFlower?.flowerName
      });
    }
  }, [buyerInfo, sellerInfo, selectedFlower]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200">
      {/* Sử dụng ChatHeader component */}
      {sellerInfo && (
        <ChatHeader
          currentUser={currentUser}
          sellerInfo={sellerInfo}
          buyerInfo={buyerInfo}
          onOpenModal={handleOpenModal}
        />
      )}

      {/* Messages Container */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-gray-50"
        style={{ scrollBehavior: 'smooth' }}
      >
        {/* Thông báo không còn tin nhắn */}

        {/* Messages */}
        {isLoadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <>
            {messages.map(msg => renderMessage(msg))}
            <div ref={messagesEndRef} className="h-0" />
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="px-6 py-4 border-t border-gray-200 bg-white">
        {/* Preview ảnh */}
        {previewUrl && (
          <div className="mb-2 relative">
            <img
              src={previewUrl}
              alt="Preview"
              className="max-h-32 rounded-lg"
            />
            <button
              onClick={clearImage}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}

        {/* Form input */}
        <div className="flex space-x-2">
          <input
            type="text"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-full bg-gray-50 
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              placeholder-gray-400 text-gray-600"
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Nhập tin nhắn..."
          />

          {/* Button chọn ảnh */}
          <label className="p-3 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageSelect}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </label>

          {/* Button gửi */}
          <button
            onClick={sendMessage}
            disabled={isSending || (!message.trim() && !selectedImage)}
            className={`px-6 py-3 bg-blue-600 text-white rounded-full font-medium 
              transition-all duration-200 flex items-center justify-center min-w-[100px]
              ${(isSending || (!message.trim() && !selectedImage))
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-blue-700 active:scale-95 hover:shadow-md'
              }`}
          >
            {isSending ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gửi...</span>
              </div>
            ) : (
              'Gửi'
            )}
          </button>
        </div>
      </div>

      {/* Modal */}
      <div className="relative z-50">
        <CreateOrderForm
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrder}
          buyerId={buyerInfo?.buyerId}
          sellerId={sellerInfo?.seller?.userId}
          flowerId={selectedFlower?.flowerId}
          flowerName={selectedFlower?.flowerName || 'Không xác định'}
        />
      </div>
    </div>
  );
};

export default ChatBox;