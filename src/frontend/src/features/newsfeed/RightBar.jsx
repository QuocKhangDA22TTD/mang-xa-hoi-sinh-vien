import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriends } from '../../api/friends';
import {
  getMyConversations,
  getMessages,
  sendMessage,
  sendFileMessage,
  createConversation,
  getUnreadCounts,
  markMessagesAsRead,
} from '../../api/chat';
import { getMe } from '../../api/auth';
import { useSocket } from '../../context/SocketContext';
import EmojiPicker from 'emoji-picker-react';
import {
  FaUserFriends,
  FaCalendarAlt,
  FaChartLine,
  FaBell,
  FaCircle,
  FaEllipsisH,
  FaPlus,
  FaSearch,
  FaUser,
  FaCog,
  FaEdit,
  FaPaperPlane,
  FaTimes,
  FaSmile,
  FaPaperclip,
  FaImage,
  FaFile,
} from 'react-icons/fa';

function RightBar() {
  const navigate = useNavigate();
  const { socket, isConnected } = useSocket();
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Debug socket connection
  useEffect(() => {
    console.log('🔍 RightBar socket state:', { socket: !!socket, isConnected });
  }, [socket, isConnected]);

  // Chat states
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({}); // {conversationId: count}
  const [friendConversations, setFriendConversations] = useState({}); // {friendId: conversationId}
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const loadingConversationRef = useRef(false); // Prevent multiple calls
  const lastClickTimeRef = useRef(0); // Debounce clicks

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages.length]); // Only depend on length, not the array itself

  // Get current user on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await getMe();
        setCurrentUser(user);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin user:', error);
      }
    };

    loadCurrentUser();
  }, []);

  // Fetch friends list on component mount
  useEffect(() => {
    const loadFriends = async () => {
      try {
        setFriendsLoading(true);
        const friendsData = await getFriends();

        // Transform API data to match our component structure
        const transformedFriends = friendsData.map((friend) => ({
          id: friend.friend_id,
          name: friend.friend_name || friend.friend_email,
          avatar: friend.friend_avatar || '/demo_avatar.jpg',
          status: 'online', // Default to online, can be enhanced later
          isFriend: true,
        }));

        setFriends(transformedFriends);
      } catch (error) {
        console.error('Lỗi khi tải danh sách bạn bè:', error);
        setFriends([]); // Set empty array on error
      } finally {
        setFriendsLoading(false);
      }
    };

    loadFriends();
  }, []);

  // Load current user and unread counts
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = await getMe();
        setCurrentUser(user);

        // Load unread counts
        const counts = await getUnreadCounts();
        console.log('🔍 Loaded unread counts:', counts);
        setUnreadCounts(counts);
      } catch (error) {
        console.error('Lỗi khi tải dữ liệu user:', error);
      }
    };

    loadUserData();
  }, []);

  // Socket listeners for real-time messages
  useEffect(() => {
    if (!socket || !currentUser) {
      console.log('🔍 Socket or currentUser not ready:', {
        socket: !!socket,
        currentUser: !!currentUser,
      });
      return;
    }

    console.log('🔍 Setting up socket listeners for user:', currentUser.id);

    const handleNewMessage = (messageData) => {
      console.log('🔍 Received new message:', messageData);

      // If chat window is open for this conversation, add message immediately
      if (
        activeConversation &&
        activeConversation.id === messageData.conversation_id
      ) {
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
        setChatMessages((prev) => [...prev, newMsg]);

        // Mark as read since user is viewing the conversation
        markMessagesAsRead(messageData.conversation_id);
      } else {
        console.log(
          '🔍 Updating unread count for conversation:',
          messageData.conversation_id
        );
        // Update unread count
        setUnreadCounts((prev) => ({
          ...prev,
          [messageData.conversation_id]: Math.min(
            (prev[messageData.conversation_id] || 0) + 1,
            5
          ),
        }));
      }
    };

    socket.on('new_message', handleNewMessage);
    console.log('🔍 Socket listener registered for new_message');

    return () => {
      console.log('🔍 Cleaning up socket listeners');
      socket.off('new_message', handleNewMessage);
    };
  }, [socket, currentUser?.id, activeConversation?.id]); // Use specific IDs to avoid unnecessary re-renders

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && !event.target.closest('.emoji-picker-container')) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Find or create conversation with friend
  const findOrCreateConversation = async (friendId) => {
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

        const memberIds = conv.members.map((m) => m.user_id);
        console.log('🔍 Member IDs:', memberIds);
        console.log('🔍 Friend ID type:', typeof friendId);
        console.log('🔍 Contains friend?', memberIds.includes(friendId));

        const isMatch =
          !conv.is_group &&
          conv.members.some(
            (member) =>
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
        setFriendConversations((prev) => ({
          ...prev,
          [friendId]: existingConversation.id,
        }));
        return existingConversation;
      }

      console.log('🔍 Creating new conversation with friend:', friendId);
      // Create new conversation if none exists
      const newConversation = await createConversation([friendId], false);
      console.log('🔍 Created new conversation:', newConversation);

      // Update friend-conversation mapping
      setFriendConversations((prev) => ({
        ...prev,
        [friendId]: newConversation.id,
      }));

      return newConversation;
    } catch (error) {
      console.error('Lỗi khi tìm/tạo conversation:', error);
      throw error;
    } finally {
      setChatLoading(false);
    }
  };

  const handleOpenChat = useCallback(
    async (friend) => {
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
          time: new Date(msg.sent_at || msg.created_at).toLocaleTimeString(
            'vi-VN',
            {
              hour: '2-digit',
              minute: '2-digit',
            }
          ),
          sender_id: msg.sender_id,
          message_type: msg.message_type || 'text',
          attachment_url: msg.attachment_url,
        }));

        setChatMessages(transformedMessages);

        // Mark messages as read and clear unread count
        await markMessagesAsRead(conversation.id);
        setUnreadCounts((prev) => ({
          ...prev,
          [conversation.id]: 0,
        }));
      } catch (error) {
        console.error('Lỗi khi mở chat:', error);
        // Fallback to empty chat if error
        setChatMessages([]);
      } finally {
        setChatLoading(false);
        loadingConversationRef.current = false;
      }
    },
    [currentUser]
  ); // Only depend on currentUser

  const handleCloseChat = () => {
    setActiveChatUser(null);
    setActiveConversation(null);
    setChatMessages([]);
    setNewMessage('');
    loadingConversationRef.current = false; // Reset loading flag
  };

  const handleSendMessage = async () => {
    console.log('🔍 handleSendMessage called');
    console.log('🔍 newMessage:', newMessage);
    console.log('🔍 activeConversation:', activeConversation);
    console.log('🔍 currentUser:', currentUser);
    console.log('🔍 chatLoading:', chatLoading);

    if (newMessage.trim() && activeConversation && currentUser) {
      try {
        console.log(
          '🔍 Sending message to conversation:',
          activeConversation.id
        );

        // Send message via API
        const sentMessage = await sendMessage(
          activeConversation.id,
          newMessage
        );

        console.log('🔍 Message sent successfully:', sentMessage);

        // Add message to local state immediately for better UX
        const newMsg = {
          id: sentMessage.id,
          text: newMessage,
          sender: 'me',
          time: new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          sender_id: currentUser.id,
        };

        setChatMessages((prev) => [...prev, newMsg]);
        setNewMessage('');
      } catch (error) {
        console.error('❌ Lỗi khi gửi tin nhắn:', error);
        // Could show error toast here
      }
    } else {
      console.log('❌ Cannot send message - missing requirements:');
      console.log('  - newMessage.trim():', !!newMessage.trim());
      console.log('  - activeConversation:', !!activeConversation);
      console.log('  - currentUser:', !!currentUser);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData) => {
    setNewMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file || !activeConversation) return;

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

      setChatMessages((prev) => [...prev, newMsg]);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('❌ Lỗi khi upload file:', error);
      alert('Không thể upload file. Vui lòng thử lại!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  };

  const [trendingTopics] = useState([
    { tag: '#SinhVienIT', posts: 1234 },
    { tag: '#HocTap', posts: 856 },
    { tag: '#CongNghe', posts: 642 },
    { tag: '#TuyenDung', posts: 423 },
  ]);

  const [upcomingEvents] = useState([
    {
      id: 1,
      title: 'Hội thảo Công nghệ AI',
      date: '2024-01-20',
      time: '14:00',
      attendees: 45,
    },
    {
      id: 2,
      title: 'Workshop React.js',
      date: '2024-01-22',
      time: '09:00',
      attendees: 32,
    },
  ]);

  return (
    <div className="p-6 space-y-6">
      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <FaPlus className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          Thao tác nhanh
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => navigate('/profile')}
            className="flex flex-col items-center p-3 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors group"
          >
            <FaUser className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
              Profile
            </span>
          </button>

          <button
            onClick={() => navigate('/update-profile')}
            className="flex flex-col items-center p-3 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-lg transition-colors group"
          >
            <FaEdit className="w-5 h-5 text-green-600 dark:text-green-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              Chỉnh sửa
            </span>
          </button>

          <button
            onClick={() => navigate('/friends')}
            className="flex flex-col items-center p-3 bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 rounded-lg transition-colors group"
          >
            <FaUserFriends className="w-5 h-5 text-purple-600 dark:text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
              Bạn bè
            </span>
          </button>

          <button className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors group">
            <FaCog className="w-5 h-5 text-gray-600 dark:text-gray-400 mb-1 group-hover:scale-110 transition-transform" />
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">
              Cài đặt
            </span>
          </button>
        </div>
      </div>

      {/* Online Friends */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <FaUserFriends className="w-4 h-4 mr-2 text-green-600 dark:text-green-400" />
            Bạn bè
          </h3>
          <button className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <FaEllipsisH className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {friendsLoading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Chưa có bạn bè nào
              </p>
              <button
                onClick={() => navigate('/friends')}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1"
              >
                Tìm bạn bè
              </button>
            </div>
          ) : (
            friends.map((friend) => (
              <button
                key={friend.id}
                onClick={() => handleOpenChat(friend)}
                className="w-full flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors text-left"
              >
                <div className="relative">
                  <img
                    src={friend.avatar}
                    alt={friend.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <FaCircle
                    className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                      friend.status === 'online'
                        ? 'text-green-500'
                        : 'text-yellow-500'
                    } bg-white dark:bg-gray-800 rounded-full`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {friend.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {friend.status === 'online' ? 'Đang hoạt động' : 'Vắng mặt'}
                  </p>
                </div>
                {/* Unread message badge */}
                {(() => {
                  // Get conversation ID for this friend
                  const conversationId = friendConversations[friend.id];
                  const unreadCount = conversationId
                    ? unreadCounts[conversationId] || 0
                    : 0;

                  return unreadCount > 0 ? (
                    <div className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                      {unreadCount > 5 ? '5+' : unreadCount}
                    </div>
                  ) : null;
                })()}
              </button>
            ))
          )}
        </div>

        <button
          onClick={() => navigate('/friends')}
          className="w-full mt-3 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
        >
          Xem tất cả bạn bè
        </button>
      </div>

      {/* Trending Topics */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
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

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
            <FaCalendarAlt className="w-4 h-4 mr-2 text-purple-600 dark:text-purple-400" />
            Sự kiện sắp tới
          </h3>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
            <FaPlus className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {upcomingEvents.map((event) => (
            <div
              key={event.id}
              className="p-3 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-100 dark:border-purple-800"
            >
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                {event.title}
              </h4>
              <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mb-2">
                <FaCalendarAlt className="w-3 h-3 mr-1" />
                {event.date} • {event.time}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {event.attendees} người tham gia
                </span>
                <button className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium">
                  Tham gia
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700 rounded-xl p-4 text-white transition-colors">
        <h3 className="font-semibold mb-3 flex items-center">
          <FaBell className="w-4 h-4 mr-2" />
          Thông báo
        </h3>
        <p className="text-sm text-blue-100 dark:text-blue-200 mb-3">
          Bạn có 3 thông báo mới chưa đọc
        </p>
        <button className="w-full bg-white/20 hover:bg-white/30 dark:bg-white/10 dark:hover:bg-white/20 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors">
          Xem tất cả
        </button>
      </div>

      {/* Chat Window */}
      {activeChatUser && (
        <div className="fixed bottom-4 right-4 w-80 h-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 transition-colors">
          {/* Chat Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-2xl">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <img
                  src={activeChatUser.avatar}
                  alt={activeChatUser.name}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <FaCircle
                  className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 ${
                    activeChatUser.status === 'online'
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  } bg-white rounded-full`}
                />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{activeChatUser.name}</h4>
                <p className="text-xs text-blue-100">
                  {activeChatUser.status === 'online'
                    ? 'Đang hoạt động'
                    : 'Vắng mặt'}
                </p>
              </div>
            </div>
            <button
              onClick={handleCloseChat}
              className="p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatLoading ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Đang tải tin nhắn...
                  </p>
                </div>
              </div>
            ) : chatMessages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Chưa có tin nhắn nào
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Hãy bắt đầu cuộc trò chuyện!
                  </p>
                </div>
              </div>
            ) : (
              chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                      message.sender === 'me'
                        ? 'bg-blue-500 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-md'
                    }`}
                  >
                    {/* Render different message types */}
                    {message.message_type === 'image' &&
                    message.attachment_url ? (
                      <div>
                        <img
                          src={message.attachment_url}
                          alt="Shared image"
                          className="max-w-xs max-h-64 rounded-lg cursor-pointer hover:opacity-90"
                          onClick={() =>
                            window.open(message.attachment_url, '_blank')
                          }
                        />
                        {message.text && <p className="mt-2">{message.text}</p>}
                      </div>
                    ) : message.message_type === 'file' &&
                      message.attachment_url ? (
                      <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-600 rounded">
                        <FaFile className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                        <a
                          href={message.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline text-sm"
                        >
                          {message.text || 'File đính kèm'}
                        </a>
                      </div>
                    ) : (
                      <p>{message.text}</p>
                    )}

                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'me'
                          ? 'text-blue-100'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {message.time}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 relative">
            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-16 left-4 z-50 emoji-picker-container">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  theme="auto"
                  width={300}
                  height={400}
                />
              </div>
            )}

            <div className="flex items-center space-x-2">
              {/* File Upload Button */}
              <button
                onClick={handleFileButtonClick}
                disabled={isUploading || !activeConversation}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 transition-colors"
                title="Gửi file"
              >
                {isUploading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                ) : (
                  <FaPaperclip className="w-4 h-4" />
                )}
              </button>

              {/* Emoji Button */}
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                title="Chọn emoji"
              >
                <FaSmile className="w-4 h-4" />
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx,.txt"
                className="hidden"
              />

              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-colors"
              />
              <button
                onClick={handleSendMessage}
                disabled={
                  !newMessage.trim() ||
                  chatLoading ||
                  !activeConversation ||
                  isUploading
                }
                className="p-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-600 text-white rounded-full transition-colors"
              >
                <FaPaperPlane className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RightBar;
