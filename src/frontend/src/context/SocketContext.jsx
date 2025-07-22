import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(undefined);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
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

      setSocket(newSocket);

      return () => {
        console.log('🔍 Cleaning up socket connection');
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

  const value = {
    socket,
    isConnected,
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
