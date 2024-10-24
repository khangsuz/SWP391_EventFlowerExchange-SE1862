import React from 'react';
import { useParams } from 'react-router-dom';
import ChatBox from './index';
import Header from '../../component/header';
import Footer from '../../component/footer';
const ChatPage = () => {
  const { conversationId } = useParams();

  return (
    <>
    <Header />
    <div className="container mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <ChatBox conversationId={conversationId} />
    </div>
    <Footer />
    </>
  );
};

export default ChatPage;