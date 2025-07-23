import { useState, useEffect, useRef } from 'react';
import { FaComments } from 'react-icons/fa';
import { getMessages, sendMessage } from '../../api/chat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInputArea from './ChatInputArea';

function ChatArea({ selectedChat, user, socket, onConversationUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages when chat is selected
  useEffect(() => {
    if (selectedChat) {
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [selectedChat]);

  // Socket listener for new messages
  useEffect(() => {
    if (!socket || !selectedChat) return;

    const handleNewMessage = (messageData) => {
      if (messageData.conversation_id === selectedChat.id) {
        const newMsg = {
          id: messageData.id,
          text: messageData.text,
          sender_id: messageData.sender_id,
          sent_at: messageData.sent_at,
          sender_email: messageData.sender_email,
        };
        setMessages(prev => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    socket.on('receive_message', handleNewMessage);
    return () => socket.off('receive_message', handleNewMessage);
  }, [socket, selectedChat]);

  // Auto scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    if (!selectedChat) return;

    try {
      setLoadingMessages(true);
      const data = await getMessages(selectedChat.id);
      setMessages(data);
    } catch (error) {
      console.error('Lỗi khi tải tin nhắn:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || sending) return;

    const messageText = newMessage.trim();
    setNewMessage('');

    try {
      setSending(true);
      
      // Add message to local state immediately for better UX
      const tempMessage = {
        id: Date.now(), // Temporary ID
        text: messageText,
        sender_id: user.id,
        sent_at: new Date().toISOString(),
        sender_email: user.email,
        sending: true,
      };
      setMessages(prev => [...prev, tempMessage]);

      // Send message to server
      const sentMessage = await sendMessage(selectedChat.id, messageText);
      
      // Update the temporary message with real data
      setMessages(prev => 
        prev.map(msg => 
          msg.id === tempMessage.id 
            ? { ...sentMessage, sender_email: user.email, sending: false }
            : msg
        )
      );

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('send_message', {
          conversation_id: selectedChat.id,
          text: messageText,
          sender_id: user.id,
          sender_email: user.email,
        });
      }

      // Update conversation list
      onConversationUpdate?.();
      
    } catch (error) {
      console.error('Lỗi khi gửi tin nhắn:', error);
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
      // Restore the message text
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Empty state when no chat is selected
  if (!selectedChat) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaComments className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Chọn một cuộc trò chuyện
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Chọn cuộc trò chuyện từ danh sách bên trái để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-gray-800">
      {/* Chat Header */}
      <ChatHeader conversation={selectedChat} />

      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        <ChatMessages
          messages={messages}
          loading={loadingMessages}
          currentUser={user}
          messagesEndRef={messagesEndRef}
        />
      </div>

      {/* Input Area */}
      <ChatInputArea
        message={newMessage}
        onMessageChange={setNewMessage}
        onSend={handleSendMessage}
        onKeyPress={handleKeyPress}
        sending={sending}
        disabled={!selectedChat}
      />
    </div>
  );
}

export default ChatArea;
