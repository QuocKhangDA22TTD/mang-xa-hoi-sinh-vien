import { useState, useEffect, useRef, useCallback } from 'react';
import {
  getMyConversations,
  getMessages,
  sendMessage,
  sendFileMessage,
  getUnreadCounts,
  markMessagesAsRead,
  createConversation,
} from '../api/chat';
import { useSocket } from '../context/SocketContext';

export function useChat(currentUser) {
  const { socket } = useSocket();
  
  // Chat states
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState({});
  const [friendConversations, setFriendConversations] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  // Refs for preventing multiple calls
  const loadingConversationRef = useRef(false);
  const lastClickTimeRef = useRef(0);

  // Load unread counts on mount
  useEffect(() => {
    const loadUnreadCounts = async () => {
      try {
        const counts = await getUnreadCounts();
        console.log('🔍 Loaded unread counts:', counts);
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Lỗi khi tải unread counts:', error);
      }
    };

    if (currentUser) {
      loadUnreadCounts();
    }
  }, [currentUser]);

  // Socket listeners for real-time messages
  useEffect(() => {
    if (!socket || !currentUser) {
      console.log('🔍 Socket or currentUser not ready:', { socket: !!socket, currentUser: !!currentUser });
      return;
    }

    console.log('🔍 Setting up socket listeners for user:', currentUser.id);

    const handleNewMessage = (messageData) => {
      console.log('🔍 Received new message:', messageData);
      
      // If chat window is open for this conversation, add message immediately
      if (activeConversation && activeConversation.id === messageData.conversation_id) {
        console.log('🔍 Adding message to active chat');
        const newMsg = {
          id: messageData.id,
          text: messageData.text,
          sender: messageData.sender_id === currentUser.id ? 'me' : 'friend',
          time: new Date(messageData.sent_at).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sender_id: messageData.sender_id,
          message_type: messageData.message_type || 'text',
          attachment_url: messageData.attachment_url,
        };
        setChatMessages(prev => [...prev, newMsg]);

        // Mark as read since user is viewing the conversation
        markMessagesAsRead(messageData.conversation_id);
      } else {
        console.log('🔍 Updating unread count for conversation:', messageData.conversation_id);
        // Update unread count
        setUnreadCounts(prev => ({
          ...prev,
          [messageData.conversation_id]: Math.min((prev[messageData.conversation_id] || 0) + 1, 5)
        }));
      }
    };

    socket.on('new_message', handleNewMessage);
    console.log('🔍 Socket listener registered for new_message');

    return () => {
      console.log('🔍 Cleaning up socket listeners');
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, currentUser?.id, activeConversation?.id]);

  // Find or create conversation with friend
  const findOrCreateConversation = useCallback(async (friendId) => {
    try {
      setChatLoading(true);
      
      console.log('🔍 Finding conversation for friend:', friendId);

      // First, get all conversations to see if one exists with this friend
      const conversations = await getMyConversations();
      console.log('🔍 All conversations:', conversations);

      // Find existing conversation with this friend (1-on-1 chat)
      const existingConversation = conversations.find((conv) => {
        console.log('🔍 Checking conversation:', conv);
        console.log('🔍 Members:', conv.members);
        console.log('🔍 Is group:', conv.is_group);
        console.log('🔍 Looking for friend ID:', friendId);
        
        if (!conv.members || !Array.isArray(conv.members)) {
          console.log('❌ No members array found');
          return false;
        }
        
        const memberIds = conv.members.map(m => m.user_id);
        console.log('🔍 Member IDs:', memberIds);
        console.log('🔍 Friend ID type:', typeof friendId);
        console.log('🔍 Contains friend?', memberIds.includes(friendId));
        
        const isMatch = !conv.is_group && 
                       conv.members.some((member) => 
                         member.user_id === friendId || 
                         member.user_id === parseInt(friendId) ||
                         parseInt(member.user_id) === parseInt(friendId)
                       );
        
        console.log('🔍 Conversation match result:', isMatch);
        return isMatch;
      });

      if (existingConversation) {
        console.log('🔍 Found existing conversation:', existingConversation);
        // Update friend-conversation mapping
        setFriendConversations(prev => ({
          ...prev,
          [friendId]: existingConversation.id
        }));
        return existingConversation;
      }

      console.log('🔍 Creating new conversation with friend:', friendId);
      // Create new conversation if none exists
      const newConversation = await createConversation([friendId], false);
      console.log('🔍 Created new conversation:', newConversation);
      
      // Update friend-conversation mapping
      setFriendConversations(prev => ({
        ...prev,
        [friendId]: newConversation.id
      }));
      
      return newConversation;
    } catch (error) {
      console.error('Lỗi khi tìm/tạo conversation:', error);
      throw error;
    } finally {
      setChatLoading(false);
    }
  }, []);

  // Open chat with friend
  const handleOpenChat = useCallback(async (friend) => {
    // Debounce rapid clicks
    const now = Date.now();
    if (now - lastClickTimeRef.current < 1000) {
      console.log('🔍 Click too soon, debouncing...');
      return;
    }
    lastClickTimeRef.current = now;

    // Prevent multiple simultaneous calls
    if (loadingConversationRef.current) {
      console.log('🔍 Already loading conversation, skipping...');
      return;
    }

    try {
      loadingConversationRef.current = true;
      setActiveChatUser(friend);
      setChatMessages([]);
      setChatLoading(true);

      console.log('🔍 Opening chat for friend:', friend.id);

      // Find or create conversation
      const conversation = await findOrCreateConversation(friend.id);
      setActiveConversation(conversation);

      console.log('🔍 Loading messages for conversation:', conversation.id);
      // Load chat history
      const messages = await getMessages(conversation.id);

      // Transform messages to match our component format
      const transformedMessages = messages.map((msg) => ({
        id: msg.id,
        text: msg.text,
        sender: msg.sender_id === currentUser?.id ? 'me' : 'friend',
        time: new Date(msg.sent_at || msg.created_at).toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sender_id: msg.sender_id,
        message_type: msg.message_type || 'text',
        attachment_url: msg.attachment_url,
      }));

      setChatMessages(transformedMessages);

      // Mark messages as read and clear unread count
      await markMessagesAsRead(conversation.id);
      setUnreadCounts(prev => ({
        ...prev,
        [conversation.id]: 0
      }));
    } catch (error) {
      console.error('Lỗi khi mở chat:', error);
      // Fallback to empty chat if error
      setChatMessages([]);
    } finally {
      setChatLoading(false);
      loadingConversationRef.current = false;
    }
  }, [currentUser, findOrCreateConversation]);

  // Close chat
  const handleCloseChat = useCallback(() => {
    setActiveChatUser(null);
    setActiveConversation(null);
    setChatMessages([]);
    loadingConversationRef.current = false;
  }, []);

  // Send text message
  const handleSendMessage = useCallback(async (text) => {
    if (text.trim() && activeConversation && currentUser) {
      try {
        console.log('🔍 Sending message:', text);
        
        // Send message via API
        const sentMessage = await sendMessage(activeConversation.id, text);
        
        // Add message to local state immediately for better UX
        const newMsg = {
          id: sentMessage.id,
          text: text,
          sender: 'me',
          time: new Date().toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          sender_id: currentUser.id,
          message_type: 'text',
          attachment_url: null,
        };
        
        setChatMessages(prev => [...prev, newMsg]);
      } catch (error) {
        console.error('❌ Lỗi khi gửi tin nhắn:', error);
        alert('Không thể gửi tin nhắn. Vui lòng thử lại!');
      }
    }
  }, [activeConversation, currentUser]);

  // Send file message
  const handleSendFile = useCallback(async (file) => {
    if (!file || !activeConversation || !currentUser) return;

    try {
      setIsUploading(true);
      console.log('🔍 Uploading file:', file.name);

      const result = await sendFileMessage(activeConversation.id, file);
      
      // Add file message to chat immediately
      const newMsg = {
        id: result.id,
        text: result.text || file.name,
        sender: 'me',
        time: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        sender_id: currentUser.id,
        message_type: result.message_type,
        attachment_url: result.attachment_url,
      };

      setChatMessages(prev => [...prev, newMsg]);
    } catch (error) {
      console.error('❌ Lỗi khi upload file:', error);
      alert('Không thể upload file. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  }, [activeConversation, currentUser]);

  return {
    // States
    activeChatUser,
    activeConversation,
    chatMessages,
    chatLoading,
    unreadCounts,
    friendConversations,
    isUploading,
    
    // Actions
    handleOpenChat,
    handleCloseChat,
    handleSendMessage,
    handleSendFile,
  };
}
