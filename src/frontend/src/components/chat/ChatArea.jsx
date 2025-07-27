import { useState, useEffect, useRef } from 'react';
import { FaComments } from 'react-icons/fa';
import { getMessages, sendMessage, sendFileMessage } from '../../api/chat';
import ChatHeader from './ChatHeader';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import GroupManagementModal from './GroupManagementModal';

function ChatArea({ selectedChat, user, socket, onConversationUpdate }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showGroupManagement, setShowGroupManagement] = useState(false);
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
          sender_name: messageData.sender_name,
          sender_avatar: messageData.sender_avatar,
          message_type: messageData.message_type || 'text',
          attachment_url: messageData.attachment_url,
        };
        setMessages((prev) => [...prev, newMsg]);
        scrollToBottom();
      }
    };

    socket.on('new_message', handleNewMessage);
    return () => socket.off('new_message', handleNewMessage);
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

  const handleSendMessage = async (text) => {
    const messageText = text?.trim() || newMessage.trim();
    if (!messageText || !selectedChat || sending) return;

    setNewMessage('');

    try {
      setSending(true);

      // Send message to server first
      const sentMessage = await sendMessage(selectedChat.id, messageText);

      // Add message to local state with real ID
      const newMessage = {
        id: sentMessage.data?.id || sentMessage.id || Date.now(),
        text: messageText,
        sender_id: user.id,
        sent_at:
          sentMessage.data?.sent_at ||
          sentMessage.sent_at ||
          new Date().toISOString(),
        sender_email: user.email,
        sender_name: user.full_name || user.name,
        sender_avatar: user.avatar_url,
        message_type: 'text',
        attachment_url: null,
      };

      setMessages((prev) => [...prev, newMessage]);

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
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
      // Restore the message text
      setNewMessage(messageText);
    } finally {
      setSending(false);
    }
  };

  const handleSendFile = async (file) => {
    if (!file || !selectedChat || !user) return;

    try {
      setIsUploading(true);
      console.log('🔍 Sending file:', file.name);

      // Send file via API
      const sentMessage = await sendFileMessage(selectedChat.id, file);
      console.log('🔍 File sent successfully:', sentMessage);

      // Determine message type based on file type
      const messageType = file.type.startsWith('image/') ? 'image' : 'file';
      console.log(
        '🔍 ChatArea - File type:',
        file.type,
        '→ Message type:',
        messageType
      );

      // Add message to local state with real data
      const newMsg = {
        id: sentMessage.data?.id || sentMessage.id || Date.now(),
        text: file.name,
        sender_id: user.id,
        sent_at:
          sentMessage.data?.sent_at ||
          sentMessage.sent_at ||
          new Date().toISOString(),
        sender_email: user.email,
        sender_name: user.full_name || user.name,
        sender_avatar: user.avatar_url,
        message_type: messageType,
        attachment_url:
          sentMessage.data?.attachment_url || sentMessage.attachment_url,
      };

      setMessages((prev) => [...prev, newMsg]);

      // Emit to socket for real-time updates
      if (socket) {
        socket.emit('send_message', {
          conversation_id: selectedChat.id,
          text: file.name,
          sender_id: user.id,
          sender_email: user.email,
          sender_name: user.full_name || user.name,
          sender_avatar: user.avatar_url,
          message_type: messageType,
          attachment_url:
            sentMessage.data?.attachment_url || sentMessage.attachment_url,
        });
      }

      // Update conversation list
      onConversationUpdate?.();
    } catch (error) {
      console.error('❌ Lỗi khi gửi file:', error);
      alert('Không thể gửi file. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
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
      <ChatHeader
        conversation={selectedChat}
        onGroupManage={() => setShowGroupManagement(true)}
      />

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
      <ChatInput
        onSendMessage={(text) => {
          setNewMessage('');
          handleSendMessage(text);
        }}
        onSendFile={handleSendFile}
        isUploading={isUploading}
        disabled={!selectedChat}
      />

      {/* Group Management Modal */}
      {selectedChat?.is_group && (
        <GroupManagementModal
          isOpen={showGroupManagement}
          onClose={() => setShowGroupManagement(false)}
          conversation={selectedChat}
          onMemberAdded={() => {
            // Refresh conversation data if needed
            onConversationUpdate && onConversationUpdate();
          }}
          onMemberRemoved={() => {
            // Refresh conversation data if needed
            onConversationUpdate && onConversationUpdate();
          }}
          onGroupUpdated={() => {
            // Refresh conversation data if needed
            onConversationUpdate && onConversationUpdate();
          }}
        />
      )}
    </div>
  );
}

export default ChatArea;
