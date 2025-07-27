import { useState } from 'react';
import {
  FaComments,
  FaPlus,
  FaArrowLeft,
  FaSearch,
  FaUsers,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import ConversationList from './ConversationList';
import FriendsList from './FriendsList';
import CreateGroupModal from './CreateGroupModal';

function ChatSidebar({
  activeTab,
  onTabChange,
  conversations,
  friends,
  loadingConversations,
  loadingFriends,
  selectedChat,
  onConversationSelect,
  onFriendSelect,
  onRefresh,
}) {
  // Filter conversations based on search term
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Debug conversations data (only if there are issues)
  if (conversations && conversations.some((conv) => !conv || !conv.id)) {
    console.log('🔍 ChatSidebar - Found invalid conversations:', conversations);
  }

  const filteredConversations = (conversations || []).filter((conv) => {
    if (!conv) {
      return false;
    }

    // For group conversations, search by name
    if (conv.is_group && conv.name) {
      if (conv.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return true;
      }
    }

    // For all conversations, search by member names
    if (conv.members && Array.isArray(conv.members)) {
      return conv.members.some((member) => {
        if (!member) return false;
        const memberName =
          member.full_name ||
          member.nickname ||
          member.username ||
          member.email ||
          '';
        return memberName.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    return false;
  });

  const filteredFriends = (friends || []).filter(
    (friend) =>
      friend.friend_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      friend.friend_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate('/home')}
            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            <span className="font-medium">Trở về</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowCreateGroupModal(true)}
              className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Tạo nhóm chat"
            >
              <FaUsers className="w-4 h-4" />
            </button>
            <button
              onClick={onRefresh}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Làm mới"
            >
              <FaPlus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Tin nhắn
        </h1>

        {/* Search */}
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Tìm kiếm cuộc trò chuyện..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onTabChange('groups')}
          className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'groups'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FaUsers className="w-4 h-4 mr-2" />
          Nhóm chat
        </button>
        <button
          onClick={() => onTabChange('friends')}
          className={`flex-1 flex items-center justify-center py-3 px-4 text-sm font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FaComments className="w-4 h-4 mr-2" />
          Nhắn tin với bạn bè
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'groups' && (
          <div>
            {/* Create Group Button */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowCreateGroupModal(true)}
                className="w-full flex items-center justify-center py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <FaPlus className="w-4 h-4 mr-2" />
                Tạo nhóm mới
              </button>
            </div>

            {/* Groups List */}
            <ConversationList
              conversations={filteredConversations.filter(
                (conv) => conv && conv.is_group
              )}
              loading={loadingConversations}
              selectedChat={selectedChat}
              onSelect={onConversationSelect}
            />
          </div>
        )}

        {activeTab === 'friends' && (
          <div className="space-y-4">
            {/* Friend Conversations */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2">
                Cuộc trò chuyện
              </h3>
              <ConversationList
                conversations={filteredConversations.filter(
                  (conv) => conv && !conv.is_group
                )}
                loading={loadingConversations}
                selectedChat={selectedChat}
                onSelect={onConversationSelect}
              />
            </div>

            {/* Friends List */}
            <div>
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 px-4 py-2">
                Bạn bè
              </h3>
              <FriendsList
                friends={filteredFriends}
                loading={loadingFriends}
                onSelect={onFriendSelect}
                avatarSize="large"
                variant="chat"
              />
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        onGroupCreated={(newGroup) => {
          setShowCreateGroupModal(false);
          onRefresh(); // Refresh conversations list
          onConversationSelect(newGroup); // Select the new group
        }}
      />
    </div>
  );
}

export default ChatSidebar;
