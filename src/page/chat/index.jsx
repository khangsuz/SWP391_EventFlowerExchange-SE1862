import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import api from 'axios';

const ChatBox = ({ conversationId  }) => {
    const [messages, setMessages] = useState([]);
    const [connection, setConnection] = useState(null);
    const [message, setMessage] = useState("");
    const [user, setUser] = useState("Buyer");

    useEffect(() => {
        const newConnection = new signalR.HubConnectionBuilder()
            .withUrl("https://localhost:7288/chathub")
            .withAutomaticReconnect()
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
          connection.start()
            .then(result => {
              console.log('Connected!');      
              connection.on('ReceiveMessage', (user, message) => {
                setMessages(messages => [...messages, { user, message }]);
              });

              // Tải lịch sử chat khi kết nối thành công
              loadChatHistory();
            })
            .catch(e => {
              console.log('Connection failed: ', e);
            });
      
          connection.onclose(() => {
            console.log('Connection closed');
          });
        }
    }, [connection, conversationId]);

    const loadChatHistory = async () => {
        try {
          const response = await api.get(`Chat/history/${conversationId}`);
          // Kiểm tra nếu response.data là mảng
          if (Array.isArray(response.data)) {
            setMessages(response.data);
          } else {
            setMessages([]);  // Đảm bảo luôn là mảng
          }
        } catch (error) {
          console.error("Failed to load chat history", error);
          setMessages([]);  // Nếu có lỗi, cũng đảm bảo là mảng trống
        }
    };

    const sendMessage = async () => {
        if (connection && connection.state === "Connected") {
          await connection.send('SendMessage', user, message);
          setMessage("");
        } else {
          alert("No connection to server yet.");
        }
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4">Chat</h2>
            <div className="chat-window">
                {messages?.map((msg, index) => (  // Sử dụng toán tử bảo vệ để tránh lỗi
                    <div key={index} className="mb-2">
                        <strong>{msg.user}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <input
                type="text"
                className="w-full p-2 border border-gray-300 rounded mt-2"
                value={message}
                onChange={e => setMessage(e.target.value)}
            />
            <button onClick={sendMessage} className="bg-blue-500 text-white p-2 mt-2 rounded">
                Send
            </button>
        </div>
    );
};

export default ChatBox;
