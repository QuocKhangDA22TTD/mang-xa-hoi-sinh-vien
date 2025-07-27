import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [friendsStatus, setFriendsStatus] = useState({}); // Track friends online status
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('🔍 Connecting to socket for user:', user.id);

      const newSocket = io('http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('✅ Socket connected:', newSocket.id);
        setIsConnected(true);

        // Join user room for personal notifications
        newSocket.emit('join_user_room', user.id);
      });

      newSocket.on('joined_user_room', (data) => {
        console.log('✅ Joined user room:', data);
      });

      newSocket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
        setIsConnected(false);
      });

      // Listen for friend status changes
      newSocket.on('friend_status_change', (statusData) => {
        console.log('👥 Friend status change:', statusData);
        setFriendsStatus((prev) => ({
          ...prev,
          [statusData.userId]: {
            isOnline: statusData.isOnline,
            lastActive: statusData.lastActive,
          },
        }));
      });

      // Debug: Listen for friend request events
      newSocket.on('friend_request_received', (data) => {
        console.log('🔍 SocketContext: friend_request_received event:', data);
      });

      newSocket.on('friend_request_accepted', (data) => {
        console.log('🔍 SocketContext: friend_request_accepted event:', data);
      });

      newSocket.on('friend_request_declined', (data) => {
        console.log('🔍 SocketContext: friend_request_declined event:', data);
      });

      // Test listener
      newSocket.on('test_notification', (data) => {
        console.log('🧪 Test notification received:', data);
      });

      setSocket(newSocket);

      return () => {
        console.log('🔍 Cleaning up socket connection');
        newSocket.off('friend_request_received');
        newSocket.off('friend_request_accepted');
        newSocket.off('friend_request_declined');
        newSocket.off('test_notification');
        newSocket.off('post_liked');
        newSocket.off('post_unliked');
        newSocket.off('comment_added');
        newSocket.off('comment_deleted');
        newSocket.close();
        setSocket(null);
        setIsConnected(false);
      };
    } else {
      // User logged out, disconnect socket
      if (socket) {
        console.log('🔍 User logged out, disconnecting socket');
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    }
  }, [user?.id]); // Only depend on user.id, not the whole user object

  // Helper function to get friend status
  const getFriendStatus = (friendId) => {
    return friendsStatus[friendId] || { isOnline: false, lastActive: null };
  };

  const value = {
    socket,
    isConnected,
    friendsStatus,
    getFriendStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket phải được dùng bên trong SocketProvider');
  }
  return context;
};
