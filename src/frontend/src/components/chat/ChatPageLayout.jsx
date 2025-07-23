import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import ChatSidebar from './ChatSidebar';
import ChatArea from './ChatArea';
import { getMyConversations } from '../../api/chat';
import { getFriends } from '../../api/friends';

function ChatPageLayout() {
  const { user, loading } = useAuth();
  const { socket } = useSocket();
  
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
      const data = await getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Lỗi khi tải danh sách bạn bè:', error);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleConversationSelect = (conversation) => {
    setSelectedChat(conversation);
  };

  const handleFriendSelect = async (friend) => {
    // Create or find conversation with friend
    try {
      // Implementation for creating conversation with friend
      // This would be similar to the original logic
      console.log('Starting chat with friend:', friend);
    } catch (error) {
      console.error('Lỗi khi tạo cuộc trò chuyện:', error);
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
