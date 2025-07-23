import { useRef, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { markMessagesAsRead } from '../../api/chat';

function ChatWindow({
  activeChatUser,
  chatMessages,
  chatLoading,
  onClose,
  onSendMessage,
  onSendFile,
  isUploading,
  activeConversation,
  currentUser,
}) {
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length]);

  // Mark messages as read when chat opens
  useEffect(() => {
    if (activeConversation && chatMessages.length > 0) {
      markMessagesAsRead(activeConversation.id).catch(console.error);
    }
  }, [activeConversation, chatMessages.length]);

  if (!activeChatUser) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 h-96 max-h-[calc(100vh-2rem)] bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <img
            src={activeChatUser.avatar || '/demo-avatar.svg'}
            alt={activeChatUser.name}
            className="w-8 h-8 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/demo-avatar.svg';
            }}
          />
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">
              {activeChatUser.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeChatUser.status === 'online'
                ? 'Đang hoạt động'
                : 'Vắng mặt'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <FaTimes className="w-4 h-4" />
        </button>
      </div>

      {/* Messages - Takes remaining space */}
      <div className="flex-1 min-h-0">
        <MessageList
          messages={chatMessages}
          loading={chatLoading}
          messagesEndRef={messagesEndRef}
          currentUser={currentUser}
        />
      </div>

      {/* Chat Input - Fixed at bottom */}
      <div className="flex-shrink-0">
        <ChatInput
          onSendMessage={onSendMessage}
          onSendFile={onSendFile}
          isUploading={isUploading}
          disabled={!activeConversation}
        />
      </div>
    </div>
  );
}

export default ChatWindow;
