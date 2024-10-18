import React from 'react';
import { useParams } from 'react-router-dom';
import ChatBox from './index';

const ChatPage = () => {
  const { conversationId } = useParams();

  return (
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <ChatBox conversationId={conversationId} />
    </div>
  );
};

export default ChatPage;