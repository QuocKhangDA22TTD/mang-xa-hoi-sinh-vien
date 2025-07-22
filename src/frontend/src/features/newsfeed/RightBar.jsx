import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFriends } from '../../api/friends';
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
} from 'react-icons/fa';

function RightBar() {
  const navigate = useNavigate();
  const [friends, setFriends] = useState([]);
  const [friendsLoading, setFriendsLoading] = useState(true);

  // Chat states
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  // Sample chat messages
  const sampleMessages = {
    1: [
      { id: 1, text: 'Chào bạn!', sender: 'friend', time: '10:30' },
      {
        id: 2,
        text: 'Hôm nay bạn có khỏe không?',
        sender: 'friend',
        time: '10:31',
      },
      {
        id: 3,
        text: 'Chào! Mình khỏe, cảm ơn bạn',
        sender: 'me',
        time: '10:35',
      },
    ],
    2: [
      {
        id: 1,
        text: 'Bài tập hôm nay khó quá!',
        sender: 'friend',
        time: '14:20',
      },
      { id: 2, text: 'Mình cũng thấy vậy', sender: 'me', time: '14:22' },
    ],
  };

  const handleOpenChat = (friend) => {
    setActiveChatUser(friend);
    setChatMessages(sampleMessages[friend.id] || []);
  };

  const handleCloseChat = () => {
    setActiveChatUser(null);
    setChatMessages([]);
    setNewMessage('');
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && activeChatUser) {
      const newMsg = {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        time: new Date().toLocaleTimeString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
      setChatMessages((prev) => [...prev, newMsg]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
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
            Bạn bè (Click để chat)
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
            {chatMessages.map((message) => (
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
                  <p>{message.text}</p>
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
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <FaPaperclip className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                <FaSmile className="w-4 h-4" />
              </button>
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
                disabled={!newMessage.trim()}
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
