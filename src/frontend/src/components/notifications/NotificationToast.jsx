import React, { useState, useEffect } from 'react';
import {
  FaTimes,
  FaComment,
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
} from 'react-icons/fa';
import { useNotification } from '../../context/NotificationContext';

function NotificationToast() {
  const { notifications, markAsRead } = useNotification();
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  // Get icon based on notification type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'friend_request':
        return <FaUserPlus className="w-5 h-5 text-white" />;
      case 'friend_accepted':
        return <FaUserCheck className="w-5 h-5 text-white" />;
      case 'friend_declined':
        return <FaUserTimes className="w-5 h-5 text-white" />;
      case 'message':
      default:
        return <FaComment className="w-5 h-5 text-white" />;
    }
  };

  // Get border color based on notification type
  const getBorderColor = (type) => {
    switch (type) {
      case 'friend_request':
        return 'border-l-green-500';
      case 'friend_accepted':
        return 'border-l-blue-500';
      case 'friend_declined':
        return 'border-l-red-500';
      case 'message':
      default:
        return 'border-l-blue-500';
    }
  };

  // Show only recent unread notifications as toasts
  useEffect(() => {
    const recentUnread = notifications
      .filter((notif) => !notif.read)
      .slice(0, 3); // Show max 3 toasts, no time limit

    setVisibleNotifications(recentUnread);
  }, [notifications]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {visibleNotifications.map((notification) => (
        <div
          key={notification.id}
          className={`bg-white dark:bg-gray-800 border-l-4 ${getBorderColor(notification.type)} border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm animate-slide-in-right cursor-pointer hover:shadow-xl transition-shadow`}
          onClick={() => {
            markAsRead(notification.id);
            // Could navigate to conversation here
            console.log(
              '🔔 Toast clicked, open conversation:',
              notification.conversationId
            );
          }}
        >
          <div className="flex items-start space-x-3 cursor-pointer">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {notification.avatar ? (
                <img
                  src={notification.avatar}
                  alt={notification.title}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = '/demo-avatar.svg';
                  }}
                />
              ) : (
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    notification.type === 'friend_request'
                      ? 'bg-green-500'
                      : notification.type === 'friend_accepted'
                        ? 'bg-blue-500'
                        : notification.type === 'friend_declined'
                          ? 'bg-red-500'
                          : 'bg-blue-500'
                  }`}
                >
                  {getNotificationIcon(notification.type)}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {notification.title}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    markAsRead(notification.id);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Đánh dấu đã đọc"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                {notification.message}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {formatTime(notification.timestamp)}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function formatTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);

  if (seconds < 60) {
    return 'Vừa xong';
  } else if (minutes < 60) {
    return `${minutes} phút trước`;
  } else {
    return timestamp.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default NotificationToast;
