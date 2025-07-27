import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider'
    );
  }
  return context;
};

export function NotificationProvider({ children }) {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [permission, setPermission] = useState(Notification.permission);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && permission === 'default') {
      Notification.requestPermission().then((result) => {
        setPermission(result);
        console.log('🔔 Notification permission:', result);
      });
    }
  }, [permission]);

  // Listen for new messages via socket
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (message) => {
      console.log('🔔 New message notification:', message);

      // Don't notify for own messages
      if (message.sender_id === user.id) return;

      // Create notification
      const notification = {
        id: Date.now(),
        type: 'message',
        title: message.sender_name || 'Tin nhắn mới',
        message: message.text || 'Bạn có tin nhắn mới',
        avatar: message.sender_avatar,
        conversationId: message.conversation_id,
        timestamp: new Date(),
        read: false,
      };

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev]);

      // Show browser notification if permission granted
      if (permission === 'granted') {
        showBrowserNotification(notification);
      }

      // Play notification sound
      playNotificationSound();
    };

    // Handle friend request notifications
    const handleFriendRequestReceived = (data) => {
      console.log(
        '📨 NotificationContext: Friend request notification received:',
        data
      );
      const notification = {
        id: Date.now(),
        type: 'friend_request',
        title: 'Lời mời kết bạn mới',
        message: data.message || `${data.senderName} đã gửi lời mời kết bạn`,
        timestamp: new Date(),
        read: false,
        data: data,
      };

      addNotification(notification);
      showBrowserNotification(notification);
      playNotificationSound();
    };

    const handleFriendRequestAccepted = (data) => {
      console.log('✅ Friend request accepted notification:', data);
      const notification = {
        id: Date.now(),
        type: 'friend_accepted',
        title: 'Lời mời được chấp nhận',
        message:
          data.message || `${data.accepterName} đã chấp nhận lời mời kết bạn`,
        timestamp: new Date(),
        read: false,
        data: data,
      };

      addNotification(notification);
      showBrowserNotification(notification);
      playNotificationSound();
    };

    const handleFriendRequestDeclined = (data) => {
      console.log('❌ Friend request declined notification:', data);
      const notification = {
        id: Date.now(),
        type: 'friend_declined',
        title: 'Lời mời bị từ chối',
        message:
          data.message || `${data.declinerName} đã từ chối lời mời kết bạn`,
        timestamp: new Date(),
        read: false,
        data: data,
      };

      addNotification(notification);
      showBrowserNotification(notification);
      playNotificationSound();
    };

    // Handle unified notification event
    const handleNotificationReceived = (notificationData) => {
      console.log('📨 Unified notification received:', notificationData);

      const notification = {
        id: notificationData.id || Date.now(),
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.content,
        timestamp: new Date(notificationData.created_at || Date.now()),
        read: notificationData.is_read || false,
        data: notificationData.data,
      };

      addNotification(notification);
      showBrowserNotification(notification);
      playNotificationSound();
    };

    socket.on('new_message', handleNewMessage);
    socket.on('notification_received', handleNotificationReceived);
    socket.on('friend_request_received', handleFriendRequestReceived);
    socket.on('friend_request_accepted', handleFriendRequestAccepted);
    socket.on('friend_request_declined', handleFriendRequestDeclined);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('notification_received', handleNotificationReceived);
      socket.off('friend_request_received', handleFriendRequestReceived);
      socket.off('friend_request_accepted', handleFriendRequestAccepted);
      socket.off('friend_request_declined', handleFriendRequestDeclined);
    };
  }, [socket, user, permission]);

  const showBrowserNotification = (notification) => {
    try {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: notification.avatar || '/logo.png',
        badge: '/logo.png',
        tag: `message-${notification.conversationId}`,
        requireInteraction: true,
        silent: false,
      });

      // Handle click to open chat
      browserNotification.onclick = () => {
        window.focus();
        console.log(
          '🔔 Notification clicked, open conversation:',
          notification.conversationId
        );
        browserNotification.close();
      };
    } catch (error) {
      console.error('❌ Error showing browser notification:', error);
    }
  };

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification-sound.mp3');
      audio.volume = 0.5;
      audio.play().catch((error) => {
        console.log('🔇 Could not play notification sound:', error);
      });
    } catch (error) {
      console.log('🔇 Notification sound not available:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) =>
      prev.filter((notif) => notif.id !== notificationId)
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const getUnreadCount = () => {
    return notifications.filter((notif) => !notif.read).length;
  };

  const value = {
    notifications,
    permission,
    unreadCount: getUnreadCount(),
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    requestPermission: () => {
      if ('Notification' in window) {
        Notification.requestPermission().then(setPermission);
      }
    },
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}
