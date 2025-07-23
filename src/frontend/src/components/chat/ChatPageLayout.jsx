import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../hooks/useChat';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import { getMyConversations } from '../../api/chat';
import { getFriends } from '../../api/friends';

function ChatPageLayout() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  const { findOrCreateConversation } = useChat();

  // Main states
  const [selectedChat, setSelectedChat] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');

  // Load conversations on mount
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  // Load friends when tab changes to friends
  useEffect(() => {
    if (activeTab === 'friends' && friends.length === 0) {
      console.log('🔍 ChatPageLayout - Loading friends for user:', user?.id);
      loadFriends();
    }
  }, [activeTab, friends.length]);

  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      const data = await getMyConversations();
      setConversations(data);
    } catch (error) {
      console.error('Lỗi khi tải cuộc trò chuyện:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      console.log('🔍 ChatPageLayout - Loading friends...');
      const data = await getFriends();
      console.log('🔍 ChatPageLayout - Raw friends data:', data);
      console.log('🔍 ChatPageLayout - Friends count:', data?.length || 0);

      // Map backend field names to frontend expected names
      const mappedFriends = data.map((friend) => ({
        id: friend.friend_id,
        friend_id: friend.friend_id, // Keep both for compatibility
        full_name: friend.friend_name,
        email: friend.friend_email,
        avatar_url: friend.friend_avatar,
        nickname: friend.friend_name,
        is_online: friend.is_online,
        last_active: friend.last_active,
      }));

      console.log('🔍 ChatPageLayout - Mapped friends:', mappedFriends);
      setFriends(mappedFriends);
    } catch (error) {
      console.error('❌ Lỗi khi tải danh sách bạn bè:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedChat(conversation);
  };

  const handleFriendSelect = async (friend) => {
    // Create or find conversation with friend using useChat hook
    try {
      console.log('🔍 Starting chat with friend:', friend);

      // Use the friend_id from the mapped friends data
      const friendId = friend.friend_id || friend.id;
      console.log('🔍 Friend ID:', friendId);

      // Find or create conversation using useChat hook
      const conversation = await findOrCreateConversation(friendId);
      console.log('✅ Got conversation:', conversation);

      // Set as selected chat and switch to conversations tab
      setSelectedChat(conversation);
      setActiveTab('conversations');

      // Refresh conversations list to include the new one
      await loadConversations();
    } catch (error) {
      console.error('❌ Lỗi khi tạo cuộc trò chuyện:', error);
      alert('Không thể tạo cuộc trò chuyện. Vui lòng thử lại!');
    }
  };

  const refreshConversations = () => {
    loadConversations();
  };

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
