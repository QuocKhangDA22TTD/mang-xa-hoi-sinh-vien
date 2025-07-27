import { memo } from 'react';
import { FaCircle, FaUserFriends } from 'react-icons/fa';
import { useSocket } from '../../context/SocketContext';

const FriendsList = memo(function FriendsList({
  friends,
  loading,
  onFriendClick,
  onSelect,
  unreadCounts = {},
  friendConversations = {},
  showUnreadBadges = false,
  avatarSize = 'medium',
  variant = 'default',
}) {
  const { getFriendStatus } = useSocket();
  const handleClick = onFriendClick || onSelect;

  const avatarSizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-10 h-10',
    large: 'w-12 h-12',
  };

  const containerClasses = {
    default: 'space-y-2',
    chat: 'divide-y divide-gray-200 dark:divide-gray-700',
    sidebar: 'space-y-2',
  };

  const itemClasses = {
    default: 'p-3',
    chat: 'p-4',
    sidebar: 'p-3',
  };

  if (loading) {
    const skeletonCount = variant === 'chat' ? 5 : 3;
    const skeletonContainer = variant === 'chat' ? 'p-4' : 'space-y-3';

    return (
      <div className={skeletonContainer}>
        {[...Array(skeletonCount)].map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className={`flex items-center space-x-3 ${itemClasses[variant]} animate-pulse`}
          >
            <div
              className={`${avatarSizeClasses[avatarSize]} bg-gray-300 dark:bg-gray-600 rounded-full`}
            ></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <FaUserFriends className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Chưa có bạn bè nào
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400"></p>
      </div>
    );
  }

  const getFriendData = (friend) => {
    // Determine online status
    let status = 'offline';

    // Check if friend has is_online field from backend
    if (friend.is_online === 1 || friend.is_online === true) {
      status = 'online';
    } else if (friend.last_active) {
      // Check if last active was within 5 minutes
      const lastActive = new Date(friend.last_active);
      const now = new Date();
      const diffMinutes = (now - lastActive) / (1000 * 60);
      if (diffMinutes < 5) {
        status = 'online';
      }
    }

    // Handle avatar URL - prioritize profile avatar
    let avatarUrl = friend.friend_avatar || friend.avatar_url || friend.avatar;
    if (
      avatarUrl &&
      !avatarUrl.startsWith('http') &&
      !avatarUrl.startsWith('/')
    ) {
      // If it's a filename, prepend the uploads path
      avatarUrl = `https://daring-embrace-production.up.railway.app/uploads/${avatarUrl}`;
    }

    return {
      id: friend.friend_id || friend.id,
      name: friend.friend_name || friend.name || friend.full_name,
      nickname: friend.friend_nickname || friend.nickname,
      full_name: friend.friend_name || friend.full_name,
      email: friend.friend_email || friend.email,
      avatar: avatarUrl,
      status: status,
      lastActive: friend.last_active,
    };
  };

  return (
    <div className={containerClasses[variant]}>
      {friends.map((friend) => {
        const friendData = getFriendData(friend);

        // Get unread count if enabled
        const conversationId = friendConversations[friendData.id];
        const unreadCount =
          showUnreadBadges && conversationId
            ? unreadCounts[conversationId] || 0
            : 0;

        return (
          <div
            key={`friend-${friendData.id}`}
            onClick={() => {
              console.log('🔍 FriendsList - Friend clicked:', friendData);
              console.log(
                '🔍 FriendsList - handleClick function:',
                handleClick
              );
              handleClick?.(friendData);
            }}
            className={`flex items-center space-x-3 ${itemClasses[variant]} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors`}
          >
            <div className="relative">
              <img
                src={friendData.avatar || '/demo-avatar.svg'}
                alt={friendData.name || 'User'}
                className={`${avatarSizeClasses[avatarSize]} rounded-full object-cover`}
                onError={(e) => {
                  e.target.src = '/demo-avatar.svg';
                }}
              />
              {(() => {
                const friendStatus = getFriendStatus(friendData.id);
                const isOnline = friendStatus.isOnline;

                return (
                  isOnline && (
                    <div
                      className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-800 rounded-full"
                      title="Đang hoạt động"
                    />
                  )
                );
              })()}
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {friendData.full_name ||
                  friendData.nickname ||
                  friendData.name ||
                  friendData.email ||
                  'Người dùng'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(() => {
                  const friendStatus = getFriendStatus(friendData.id);
                  return friendStatus.isOnline ? 'Đang hoạt động' : 'Vắng mặt';
                })()}
              </p>
            </div>

            {showUnreadBadges && unreadCount > 0 && (
              <div className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {unreadCount > 5 ? '5+' : unreadCount}
              </div>
            )}

            {variant === 'chat' && !showUnreadBadges && (
              <div className="text-gray-400 dark:text-gray-500">
                <FaCircle className="w-2 h-2" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default FriendsList;
