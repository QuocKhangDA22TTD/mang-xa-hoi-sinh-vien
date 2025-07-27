import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import {
  getMyConversations,
  markMessagesAsRead,
  createConversation,
} from '../../api/chat';
import { getFriends } from '../../api/friends';
import { useNotification } from '../../context/NotificationContext';

function ChatPageLayout() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const { addNotification } = useNotification();

  // Main states
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [activeTab, setActiveTab] = useState('groups');

  // Debug state
  console.log('🔍 ChatPageLayout render - current user:', user);
  console.log('🔍 ChatPageLayout render - conversations:', conversations);
  console.log(
    '🔍 ChatPageLayout render - conversations type:',
    typeof conversations
  );
  console.log(
    '🔍 ChatPageLayout render - conversations is array:',
    Array.isArray(conversations)
  );

  // Define functions first
  const loadConversations = useCallback(async () => {
    try {
      setLoadingConversations(true);
      const data = await getMyConversations();
      console.log('🔍 Raw conversations data:', data);

      // Filter out null/undefined conversations
      const validConversations = (data || []).filter(
        (conv) => conv && typeof conv === 'object' && conv.hasOwnProperty('id')
      );

      console.log('🔍 Valid conversations:', validConversations);
      console.log(
        '🔍 1-on-1 conversations:',
        validConversations.filter((conv) => !conv.is_group)
      );
      console.log(
        '🔍 Group conversations:',
        validConversations.filter((conv) => conv.is_group)
      );

      // Debug members for 1-on-1 conversations
      validConversations
        .filter((conv) => !conv.is_group)
        .forEach((conv) => {
          console.log(`🔍 1-on-1 Conv ${conv.id} members:`, conv.members);
          if (conv.members && conv.members.length > 0) {
            console.log(`🔍 Conv ${conv.id} other person:`, {
              id: conv.members[0].id,
              full_name: conv.members[0].full_name,
              avatar_url: conv.members[0].avatar_url,
            });
          }
        });
      setConversations(validConversations);
    } catch (error) {
      console.error('Lỗi khi tải cuộc trò chuyện:', error);
      setConversations([]); // Set empty array on error
    } finally {
      setLoadingConversations(false);
    }
  }, []); // No dependencies needed

  const loadFriends = useCallback(async () => {
    try {
      setLoadingFriends(true);
      const data = await getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bạn bè:', error);
    } finally {
      setLoadingFriends(false);
    }
  }, []); // No dependencies needed

  // Load conversations on mount
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user?.id, loadConversations]); // Include loadConversations in dependencies

  // Load friends when tab changes to friends
  useEffect(() => {
    if (activeTab === 'friends' && friends.length === 0) {
      loadFriends();
    }
  }, [activeTab, friends.length, loadFriends]); // Include loadFriends in dependencies

  const handleConversationSelect = async (conversation) => {
    setSelectedChat(conversation);

    // Mark messages as read and update unread count
    if (conversation.unread_count > 0) {
      try {
        await markMessagesAsRead(conversation.id);
        console.log('🔍 Messages marked as read, updating unread count');

        // Update unread count to 0 for this conversation
        const updateConversationRead = (conversations) =>
          (conversations || [])
            .filter((conv) => conv && typeof conv === 'object')
            .map((conv) =>
              conv.id === conversation.id ? { ...conv, unread_count: 0 } : conv
            );

        setConversations(updateConversationRead);

        // Update selectedChat as well
        setSelectedChat((prev) => (prev ? { ...prev, unread_count: 0 } : null));
      } catch (error) {
        console.error('❌ Error marking messages as read:', error);
      }
    }
  };

  const handleFriendSelect = async (friend) => {
    console.log(
      '💬 Starting chat with friend:',
      friend.full_name || friend.email
    );

    try {
      // 🔍 Step 1: Check if conversation already exists
      const existingConversation = conversations.find((conv) => {
        // Only check 1-on-1 conversations
        if (!conv || conv.is_group) return false;

        // Check if friend is in members array
        if (conv.members && Array.isArray(conv.members)) {
          return conv.members.some(
            (member) =>
              member && (member.id === friend.id || member.id == friend.id)
          );
        }

        // Fallback: check member_ids array
        if (conv.member_ids && Array.isArray(conv.member_ids)) {
          return (
            conv.member_ids.includes(friend.id) ||
            conv.member_ids.includes(parseInt(friend.id))
          );
        }

        return false;
      });

      // ✅ Step 2: If conversation exists, select it
      if (existingConversation) {
        console.log('✅ Found existing conversation, loading...');
        setSelectedChat(existingConversation);
        addNotification({
          type: 'info',
          message: `Đã mở cuộc trò chuyện với ${friend.full_name || friend.email}`,
        });
        return;
      }

      // 🔄 Step 3: Create new conversation
      console.log('🔄 Creating new conversation...');

      const conversationData = {
        member_ids: [friend.id],
        is_group: false,
        name: null, // 1-on-1 conversations don't need names
      };

      const response = await createConversation(conversationData);
      const newConversation = response.conversation;

      // Add to conversations list and select it
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedChat(newConversation);

      console.log('✅ New conversation created and selected');
      addNotification({
        type: 'success',
        message: `Đã tạo cuộc trò chuyện mới với ${friend.full_name || friend.email}`,
      });
    } catch (error) {
      console.error('❌ Error creating conversation with friend:', error);
      addNotification({
        type: 'error',
        message: 'Không thể tạo cuộc trò chuyện. Vui lòng thử lại.',
      });
    }
  };

  const refreshConversations = () => {
    loadConversations();
  };

  // Socket listeners for real-time updates
  useEffect(() => {
    if (!socket || !user) return;

    const handleNewMessage = (messageData) => {
      console.log('🔍 ChatPageLayout - New message received:', messageData);

      // Update unread count for the conversation if user is not the sender
      if (messageData.sender_id !== user?.id) {
        const updateConversationUnread = (conversations) =>
          (conversations || [])
            .filter((conv) => conv && typeof conv === 'object')
            .map((conv) =>
              conv.id === messageData.conversation_id
                ? {
                    ...conv,
                    unread_count: (conv.unread_count || 0) + 1,
                    last_message: messageData.text || 'File attachment',
                    last_message_time: messageData.sent_at,
                  }
                : conv
            );

        setConversations(updateConversationUnread);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, user?.id]); // Only depend on user.id, not entire user object

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      {conversations ? (
        <ChatSidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          conversations={conversations}
          friends={friends}
          loadingConversations={loadingConversations}
          loadingFriends={loadingFriends}
          selectedChat={selectedChat}
          onConversationSelect={handleConversationSelect}
          onFriendSelect={handleFriendSelect}
          onRefresh={refreshConversations}
        />
      ) : (
        <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <ChatArea
        selectedChat={selectedChat}
        user={user}
        socket={socket}
        onConversationUpdate={refreshConversations}
      />
    </div>
  );
}

export default ChatPageLayout;
