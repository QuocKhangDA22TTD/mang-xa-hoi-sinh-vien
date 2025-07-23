import { memo } from 'react';
import { FaCircle } from 'react-icons/fa';

const ConversationList = memo(function ConversationList({
  conversations,
  loading,
  selectedChat,
  onSelect,
}) {
  if (loading) {
    return (
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={`conversation-skeleton-${i}`}
            className="flex items-center space-x-3 p-3 animate-pulse"
          >
            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <FaCircle className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Chưa có cuộc trò chuyện nào
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Bắt đầu trò chuyện với bạn bè của bạn
        </p>
      </div>
    );
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày`;
    return date.toLocaleDateString('vi-VN');
  };

  const getConversationName = (conversation) => {
    if (conversation.is_group) {
      return conversation.name || 'Nhóm chat';
    }

    // For 1-on-1 chats, get the other person's name
    if (conversation.members && conversation.members.length > 0) {
      const otherMember = conversation.members[0];
      return otherMember.full_name || otherMember.email || 'Người dùng';
    }

    return 'Cuộc trò chuyện';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.is_group) {
      return '/group-avatar.svg';
    }

    if (conversation.members && conversation.members.length > 0) {
      const otherMember = conversation.members[0];
      return otherMember.avatar_url || '/demo-avatar.svg';
    }

    return '/demo-avatar.svg';
  };

  const getLastMessage = (conversation) => {
    if (conversation.last_message) {
      return conversation.last_message.length > 50
        ? conversation.last_message.substring(0, 50) + '...'
        : conversation.last_message;
    }
    return 'Chưa có tin nhắn';
  };

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => onSelect(conversation)}
          className={`flex items-center space-x-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
            selectedChat?.id === conversation.id
              ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-600 dark:border-blue-400'
              : ''
          }`}
        >
          <div className="relative">
            <img
              src={getConversationAvatar(conversation)}
              alt={getConversationName(conversation)}
              className="w-12 h-12 rounded-full object-cover"
              onError={(e) => {
                e.target.src = '/demo-avatar.svg';
              }}
            />
            {/* Online status indicator - could be enhanced with real-time status */}
            {!conversation.is_group && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {getConversationName(conversation)}
              </h3>
              {conversation.last_message_time && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatTime(conversation.last_message_time)}
                </span>
              )}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">
              {getLastMessage(conversation)}
            </p>
          </div>

          {/* Unread count badge */}
          {conversation.unread_count > 0 && (
            <div className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
              {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

export default ConversationList;
