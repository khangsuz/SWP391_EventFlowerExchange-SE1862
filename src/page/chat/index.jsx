import React, { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';

const Chat = () => {
    const [connection, setConnection] = useState(null);
    const [messages, setMessages] = useState([]);
    const [userMessage, setUserMessage] = useState('');
    const [username, setUsername] = useState('User' + Math.floor(Math.random() * 100));

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
                .then(() => {
                    console.log('Connected!');

                    connection.on('ReceiveMessage', (user, message) => {
                        setMessages(messages => [...messages, { user, message }]);
                    });
                })
                .catch(error => console.log('Connection failed: ', error));
        }
    }, [connection]);

    const sendMessage = async () => {
        if (connection && userMessage) {
            try {
                await connection.invoke("SendMessage", username, userMessage);
                setUserMessage('');
            } catch (error) {
                console.error('Sending message failed: ', error);
            }
        }
    };

    return (
        <div>
            <h2>Chat Room</h2>
            <div>
                {messages.map((msg, index) => (
                    <div key={index}>
                        <strong>{msg.user}:</strong> {msg.message}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={userMessage}
                onChange={e => setUserMessage(e.target.value)}
                placeholder="Type a message"
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
};

export default Chat;
