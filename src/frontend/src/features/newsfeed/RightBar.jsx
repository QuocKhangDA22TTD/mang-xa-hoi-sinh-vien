import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriends } from '../../api/friends';
import { getMe } from '../../api/auth';
import { useSocket } from '../../context/SocketContext';
import { useChat } from '../../hooks/useChat';
import ChatWindow from '../../components/chat/ChatWindow';
import FriendsList from '../../components/chat/FriendsList';

import { FaUserFriends, FaChartLine, FaBell, FaSearch } from 'react-icons/fa';

function RightBar() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Debug socket connection
  useEffect(() => {
    console.log('🔍 RightBar socket state:', { socket: !!socket, isConnected });
  }, [socket, isConnected]);

  // Use chat hook for all chat functionality
  const {
    activeChatUser,
    activeConversation,
    chatMessages,
    chatLoading,
    unreadCounts,
    friendConversations,
    isUploading,
    handleOpenChat,
    handleCloseChat,
    handleSendMessage,
    handleSendFile,
  } = useChat(currentUser);

  // Load friends and current user
  useEffect(() => {
    const loadFriends = async () => {
      try {
        setFriendsLoading(true);
        const friendsData = await getFriends();
        setFriends(friendsData);
      } catch (error) {
        console.error('Lỗi khi tải danh sách bạn bè:', error);
      } finally {
        setFriendsLoading(false);
      }
    };

    if (currentUser) {
      loadFriends();
    }
  }, [currentUser]);

  // Load current user
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu user:', error);
      }
    };

    loadUserData();
  }, []);

  // Sample trending topics
  const [trendingTopics] = useState([
    { tag: '#SinhVienIT', posts: 1234 },
    { tag: '#HocTap', posts: 856 },
    { tag: '#LapTrinh', posts: 642 },
    { tag: '#ReactJS', posts: 428 },
    { tag: '#NodeJS', posts: 315 },
  ]);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 h-screen overflow-y-auto">
      {/* Friends Section */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <FaUserFriends className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
            Bạn bè
          </h3>
          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <FaSearch className="w-4 h-4" />
          </button>
        </div>

        <FriendsList
          friends={friends}
          loading={friendsLoading}
          onFriendClick={handleOpenChat}
          unreadCounts={unreadCounts}
          friendConversations={friendConversations}
          showUnreadBadges={true}
          avatarSize="medium"
          variant="sidebar"
        />
      </div>

      {/* Trending Section */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <FaChartLine className="w-4 h-4 mr-2 text-orange-600 dark:text-orange-400" />
            Xu hướng
          </h3>
          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <FaSearch className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {trendingTopics.map((topic, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  {topic.tag}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {topic.posts} bài viết
                </p>
              </div>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <FaBell className="w-4 h-4 mr-2 text-red-600 dark:text-red-400" />
            Thông báo
          </h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Bạn có 3 lời mời kết bạn mới
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              2 phút trước
            </p>
          </div>

          <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              Bài viết của bạn đã nhận được 5 lượt thích
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              10 phút trước
            </p>
          </div>

          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-800 dark:text-purple-200">
              Có sự kiện mới trong nhóm "Lập trình viên"
            </p>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              1 giờ trước
            </p>
          </div>
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow
        activeChatUser={activeChatUser}
        chatMessages={chatMessages}
        chatLoading={chatLoading}
        onClose={handleCloseChat}
        onSendMessage={handleSendMessage}
        onSendFile={handleSendFile}
        isUploading={isUploading}
        activeConversation={activeConversation}
        currentUser={currentUser}
      />
    </div>
  );
}

export default RightBar;
