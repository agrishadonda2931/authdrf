import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

interface Message {
    id: string;
    text: string;
    sender: string;
}

interface ActiveUsers {
    [key: string]: boolean;
}

const ChatComponent = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [activeUsers, setActiveUsers] = useState<ActiveUsers>({});
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        // Initialize socket connection
        const newSocket = io('http://localhost:3000');
        setSocket(newSocket);

        // Socket event listeners
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from WebSocket server');
        });

        newSocket.on('message', (message: Message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });

        newSocket.on('userConnected', (userId: string) => {
            setActiveUsers((prevActiveUsers) => ({ ...prevActiveUsers, [userId]: true }));
        });

        newSocket.on('userDisconnected', (userId: string) => {
            setActiveUsers((prevActiveUsers) => ({ ...prevActiveUsers, [userId]: false }));
        });

        newSocket.on('error', (error: Error) => {
            console.error('WebSocket error:', error);
        });

        // Cleanup function
        return () => {
            newSocket.off('connect');
            newSocket.off('disconnect');
            newSocket.off('message');
            newSocket.off('userConnected');
            newSocket.off('userDisconnected');
            newSocket.off('error');
            newSocket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        if (inputValue.trim() && socket) {
            const message: Message = {
                id: Date.now().toString(),
                text: inputValue,
                sender: 'user' // You might want to replace this with actual user ID
            };
            socket.emit('message', message);
            setInputValue('');
        }
    };

    return (
        <div>
            {/* Add your chat UI components here */}
            <div>
                {messages.map((message) => (
                    <div key={message.id}>
                        <strong>{message.sender}:</strong> {message.text}
                    </div>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
            <div>
                <h3>Active Users:</h3>
                {Object.entries(activeUsers).map(([userId, isActive]) => (
                    <div key={userId}>
                        {userId}: {isActive ? 'Online' : 'Offline'}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ChatComponent;