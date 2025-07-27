import {
  FaCircle,
  FaPhone,
  FaVideo,
  FaEllipsisV,
  FaUsers,
  FaCog,
} from 'react-icons/fa';

function ChatHeader({ conversation, onGroupManage }) {
  if (!conversation) return null;

  const getConversationName = () => {
    if (conversation.is_group) {
      return conversation.name || 'Nhóm chat';
    }

    if (conversation.members && conversation.members.length > 0) {
      // Backend already filtered to show only the other person
      const otherMember = conversation.members[0];
      return (
        otherMember.full_name ||
        otherMember.nickname ||
        otherMember.email ||
        'Người dùng'
      );
    }

    return 'Cuộc trò chuyện';
  };

  const getConversationAvatar = () => {
    if (conversation.is_group) {
      // For groups, use group avatar or default
      const avatar = conversation.avatar;
      console.log('🔍 ChatHeader - Group avatar:', {
        conversationId: conversation.id,
        avatar,
        fullUrl: avatar
          ? `http://localhost:5000${avatar}`
          : '/group-avatar.svg',
      });

      return avatar ? `http://localhost:5000${avatar}` : '/group-avatar.svg';
    }

    if (conversation.members && conversation.members.length > 0) {
      // Backend already filtered to show only the other person
      const otherMember = conversation.members[0];
      console.log('🔍 ChatHeader - 1-on-1 avatar:', {
        conversationId: conversation.id,
        otherMember,
        avatar_url: otherMember.avatar_url,
        fullUrl: otherMember.avatar_url
          ? `http://localhost:5000${otherMember.avatar_url}`
          : '/demo-avatar.svg',
      });

      // Use avatar_url from profile, fallback to default
      const avatar = otherMember.avatar_url;
      if (!avatar) {
        return '/demo-avatar.svg';
      }

      // If avatar already has full URL, use as is
      if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
        return avatar;
      }

      // If avatar is just filename, prepend server URL
      if (avatar.startsWith('/uploads/')) {
        return `http://localhost:5000${avatar}`;
      }

      // For demo avatars or other filenames
      if (avatar === 'demo_avatar.jpg' || avatar.includes('demo')) {
        return '/demo-avatar.svg';
      }

      // Default case: prepend server URL
      return `http://localhost:5000/uploads/${avatar}`;
    }

    return '/demo-avatar.svg';
  };

  const getOnlineStatus = () => {
    if (conversation.is_group) {
      const onlineCount =
        conversation.members?.filter((m) => m.status === 'online').length || 0;
      return `${conversation.members?.length || 0} thành viên${onlineCount > 0 ? `, ${onlineCount} đang hoạt động` : ''}`;
    }

    // For 1-on-1 chats, show online status
    return 'Đang hoạt động'; // This could be enhanced with real-time status
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Left side - Avatar and info */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <img
            src={getConversationAvatar()}
            alt={getConversationName()}
            className="w-10 h-10 rounded-full object-cover"
            onError={(e) => {
              e.target.src = '/demo-avatar.svg';
            }}
          />
          {!conversation.is_group && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"></div>
          )}
        </div>

        <div>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            {getConversationName()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getOnlineStatus()}
          </p>
        </div>
      </div>

      {/* Right side - Action buttons */}
      <div className="flex items-center space-x-2">
        {conversation.is_group && (
          <button
            onClick={onGroupManage}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Quản lý nhóm"
          >
            <FaCog className="w-4 h-4" />
          </button>
        )}

        {!conversation.is_group && (
          <>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FaPhone className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <FaVideo className="w-4 h-4" />
            </button>
          </>
        )}

        <button className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
          <FaEllipsisV className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default ChatHeader;
