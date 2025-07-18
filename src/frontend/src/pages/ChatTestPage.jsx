import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';

function ChatTestPage() {
  const socket = useSocket();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = (msg) => {
      console.log('Received message:', msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on('receiveMessage', handleReceive);
    return () => socket.off('receiveMessage', handleReceive);
  }, [socket]);

  const handleSend = () => {
    if (socket) {
      const message = 'Hello from frontend';
      console.log('✅ Sending:', message);
      socket.emit('sendMessage', message);
      setMessages((prev) => [...prev, `(You): ${message}`]);
    }
  };

  return (
    <div>
      <h1>Chat Test Page</h1>
      <button onClick={handleSend}>Send Message</button>
      <ul>
        {messages.map((msg, idx) => (
          <li key={idx}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default ChatTestPage;
