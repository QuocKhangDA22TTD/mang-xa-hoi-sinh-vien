import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FaUserPlus,
  FaUserFriends,
  FaInbox,
  FaPaperPlane,
  FaSearch,
  FaCheck,
  FaTimes,
  FaUserMinus,
  FaSpinner,
} from 'react-icons/fa';
import {
  getAllUsers,
  sendFriendRequest,
  getReceivedRequests,
  getSentRequests,
  getFriends,
  acceptFriendRequest,
  declineFriendRequest,
  unfriend,
} from '../api/friends';

function FriendsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('find'); // find, friends, received, sent
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState({});

  // Load data khi tab thay đổi
  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Search users khi searchTerm thay đổi
  useEffect(() => {
    if (activeTab === 'find') {
      const timeoutId = setTimeout(() => {
        loadUsers();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'find':
          await loadUsers();
          break;
        case 'friends':
          await loadFriends();
          break;
        case 'received':
          await loadReceivedRequests();
          break;
        case 'sent':
          await loadSentRequests();
          break;
      }
    } catch (error) {
      console.error('Lỗi load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getAllUsers(searchTerm);
      setUsers(data);
    } catch (error) {
      console.error('Lỗi load users:', error);
    }
  };

  const loadFriends = async () => {
    try {
      const data = await getFriends();
      setFriends(data);
    } catch (error) {
      console.error('Lỗi load friends:', error);
    }
  };

  const loadReceivedRequests = async () => {
    try {
      const data = await getReceivedRequests();
      setReceivedRequests(data);
    } catch (error) {
      console.error('Lỗi load received requests:', error);
    }
  };

  const loadSentRequests = async () => {
    try {
      const data = await getSentRequests();
      setSentRequests(data);
    } catch (error) {
      console.error('Lỗi load sent requests:', error);
    }
  };

  const handleSendRequest = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [`send_${userId}`]: true }));
    try {
      await sendFriendRequest(userId);
      await loadUsers(); // Refresh list
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`send_${userId}`]: false }));
    }
  };

  const handleAcceptRequest = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [`accept_${requestId}`]: true }));
    try {
      await acceptFriendRequest(requestId);
      await loadReceivedRequests(); // Refresh list
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading((prev) => ({ ...prev, [`accept_${requestId}`]: false }));
    }
  };

  const handleDeclineRequest = async (requestId) => {
    setActionLoading((prev) => ({ ...prev, [`decline_${requestId}`]: true }));
    try {
      await declineFriendRequest(requestId);
      await loadReceivedRequests(); // Refresh list
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`decline_${requestId}`]: false,
      }));
    }
  };

  const handleUnfriend = async (friendId) => {
    if (!confirm('Bạn có chắc muốn hủy kết bạn?')) return;

    setActionLoading((prev) => ({ ...prev, [`unfriend_${friendId}`]: true }));
    try {
      await unfriend(friendId);
      await loadFriends(); // Refresh list
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [`unfriend_${friendId}`]: false,
      }));
    }
  };

  const tabs = [
    { id: 'find', label: 'Tìm bạn', icon: FaUserPlus },
    { id: 'friends', label: 'Bạn bè', icon: FaUserFriends },
    { id: 'received', label: 'Lời mời nhận', icon: FaInbox },
    { id: 'sent', label: 'Lời mời gửi', icon: FaPaperPlane },
  ];

  const renderUserCard = (user, showActions = true) => (
    <div key={user.id} className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-center space-x-3">
        <img
          src={
            user.friend_avatar ||
            user.receiver_avatar ||
            user.sender_avatar ||
            user.avatar_url ||
            'demo_avatar.jpg'
          }
          alt={
            user.friend_name ||
            user.receiver_name ||
            user.sender_name ||
            user.full_name ||
            'User'
          }
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800">
            {user.friend_name ||
              user.receiver_name ||
              user.sender_name ||
              user.full_name ||
              user.friend_email ||
              user.receiver_email ||
              user.sender_email ||
              user.email}
          </h3>
          <p className="text-sm text-gray-600">
            {user.friend_email ||
              user.receiver_email ||
              user.sender_email ||
              user.email}
          </p>
        </div>
        {showActions && renderActions(user)}
      </div>
    </div>
  );

  const renderActions = (user) => {
    const userId =
      user.id || user.friend_id || user.receiver_id || user.sender_id;

    if (activeTab === 'find') {
      if (user.friendship_status === 'friend') {
        return <span className="text-green-600 text-sm">Đã là bạn</span>;
      } else if (user.friendship_status === 'sent') {
        return <span className="text-yellow-600 text-sm">Đã gửi lời mời</span>;
      } else if (user.friendship_status === 'received') {
        return <span className="text-blue-600 text-sm">Đã nhận lời mời</span>;
      } else {
        return (
          <button
            onClick={() => handleSendRequest(userId)}
            disabled={actionLoading[`send_${userId}`]}
            className="bg-[#0582CA] text-white px-3 py-1 rounded-lg text-sm hover:bg-[#0571B8] disabled:opacity-50 flex items-center space-x-1"
          >
            {actionLoading[`send_${userId}`] ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaUserPlus />
            )}
            <span>Kết bạn</span>
          </button>
        );
      }
    } else if (activeTab === 'received') {
      return (
        <div className="flex space-x-2">
          <button
            onClick={() => handleAcceptRequest(user.id)}
            disabled={actionLoading[`accept_${user.id}`]}
            className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-700 disabled:opacity-50"
          >
            {actionLoading[`accept_${user.id}`] ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaCheck />
            )}
          </button>
          <button
            onClick={() => handleDeclineRequest(user.id)}
            disabled={actionLoading[`decline_${user.id}`]}
            className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50"
          >
            {actionLoading[`decline_${user.id}`] ? (
              <FaSpinner className="animate-spin" />
            ) : (
              <FaTimes />
            )}
          </button>
        </div>
      );
    } else if (activeTab === 'friends') {
      return (
        <button
          onClick={() => handleUnfriend(userId)}
          disabled={actionLoading[`unfriend_${userId}`]}
          className="bg-red-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 flex items-center space-x-1"
        >
          {actionLoading[`unfriend_${userId}`] ? (
            <FaSpinner className="animate-spin" />
          ) : (
            <FaUserMinus />
          )}
          <span>Hủy kết bạn</span>
        </button>
      );
    } else if (activeTab === 'sent') {
      return (
        <span className="text-sm text-gray-500">
          {user.status === 'pending' ? 'Đang chờ' : user.status}
        </span>
      );
    }
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'find':
        return users;
      case 'friends':
        return friends;
      case 'received':
        return receivedRequests;
      case 'sent':
        return sentRequests;
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFFFFF] to-[#00A6FB] p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Quản lý bạn bè
          </h1>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-[#0582CA] text-white'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search (chỉ hiện ở tab tìm bạn) */}
        {activeTab === 'find' && (
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0582CA]"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <FaSpinner className="animate-spin text-[#0582CA] text-2xl mr-2" />
              <span>Đang tải...</span>
            </div>
          ) : getCurrentData().length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>
                {activeTab === 'find' && 'Không tìm thấy người dùng nào'}
                {activeTab === 'friends' && 'Bạn chưa có bạn bè nào'}
                {activeTab === 'received' && 'Không có lời mời kết bạn nào'}
                {activeTab === 'sent' && 'Bạn chưa gửi lời mời nào'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {getCurrentData().map((item) => renderUserCard(item))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendsPage;
