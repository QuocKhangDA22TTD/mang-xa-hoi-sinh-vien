import { useState, useEffect } from 'react';
import {
  FaTimes,
  FaUsers,
  FaPlus,
  FaTrash,
  FaCrown,
  FaEdit,
  FaSave,
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { getFriends } from '../../api/friends';

function GroupManagementModal({
  isOpen,
  onClose,
  conversation,
  onMemberAdded,
  onMemberRemoved,
  onGroupUpdated,
}) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  const isAdmin = conversation?.admin_id === user?.id;

  useEffect(() => {
    if (isOpen && conversation) {
      loadMembers();
      setNewGroupName(conversation.name || '');
      setError(null);
    }
  }, [isOpen, conversation]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5000/api/chat/conversations/${conversation.id}/members`,
        {
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Không thể tải danh sách thành viên');
      }

      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Lỗi khi tải thành viên:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFriends = async () => {
    try {
      console.log('🔍 GroupManagementModal - Loading friends...');
      const data = await getFriends();
      console.log('🔍 GroupManagementModal - Raw friends data:', data);

      // Map backend field names to frontend expected names
      const mappedFriends = data.map((friend) => ({
        id: friend.friend_id,
        full_name: friend.friend_name,
        email: friend.friend_email,
        avatar_url: friend.friend_avatar,
        nickname: friend.friend_name,
        is_online: friend.is_online,
        last_active: friend.last_active,
      }));

      // Filter out friends who are already members
      const memberIds = members.map((m) => m.id);
      const availableFriends = mappedFriends.filter(
        (friend) => !memberIds.includes(friend.id)
      );

      console.log(
        '🔍 GroupManagementModal - Available friends:',
        availableFriends
      );
      setFriends(availableFriends);
    } catch (error) {
      console.error('❌ GroupManagementModal - Error loading friends:', error);
      setError('Không thể tải danh sách bạn bè: ' + error.message);
    }
  };

  const addMember = async (friendId) => {
    console.log('🔍 addMember called with friendId:', friendId);
    console.log('🔍 conversation.id:', conversation.id);

    try {
      const requestBody = { userId: friendId };
      console.log('🔍 Request body:', requestBody);

      const response = await fetch(
        `http://localhost:5000/api/chat/conversations/${conversation.id}/members`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể thêm thành viên');
      }

      await loadMembers();
      await loadFriends();
      onMemberAdded && onMemberAdded();
    } catch (error) {
      console.error('Lỗi khi thêm thành viên:', error);
      setError(error.message);
    }
  };

  const removeMember = async (memberId) => {
    if (!confirm('Bạn có chắc muốn kick thành viên này?')) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/conversations/${conversation.id}/members/${memberId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể kick thành viên');
      }

      await loadMembers();
      onMemberRemoved && onMemberRemoved();
    } catch (error) {
      console.error('Lỗi khi kick thành viên:', error);
      setError(error.message);
    }
  };

  const updateGroupName = async () => {
    if (!newGroupName.trim()) {
      setError('Tên nhóm không được để trống');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/chat/conversations/${conversation.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newGroupName.trim() }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật tên nhóm');
      }

      setEditingName(false);
      onGroupUpdated && onGroupUpdated();
    } catch (error) {
      console.error('Lỗi khi cập nhật tên nhóm:', error);
      setError(error.message);
    }
  };

  if (!isOpen || !conversation) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FaUsers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Quản lý nhóm
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('members')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'members'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Thành viên ({members.length})
          </button>
          {isAdmin && (
            <button
              onClick={() => {
                setActiveTab('add');
                loadFriends();
              }}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'add'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Thêm thành viên
            </button>
          )}
          {isAdmin && (
            <button
              onClick={() => setActiveTab('settings')}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Cài đặt
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">
                    Đang tải thành viên...
                  </p>
                </div>
              ) : (
                members.map((member, index) => {
                  const uniqueKey = member.id
                    ? `member-${member.id}`
                    : `member-fallback-${index}`;
                  return (
                    <div
                      key={uniqueKey}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <img
                        src={member.avatar_url || '/demo_avatar.jpg'}
                        alt={member.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {member.full_name ||
                              member.nickname ||
                              member.email}
                          </p>
                          {member.is_admin && (
                            <FaCrown
                              className="w-3 h-3 text-yellow-500"
                              title="Admin"
                            />
                          )}
                        </div>
                        {member.nickname && member.full_name && (
                          <p className="text-xs text-gray-500">
                            @{member.nickname}
                          </p>
                        )}
                      </div>
                      {isAdmin && !member.is_admin && (
                        <button
                          onClick={() => removeMember(member.id)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          title="Kick thành viên"
                        >
                          <FaTrash className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Add Members Tab */}
          {activeTab === 'add' && isAdmin && (
            <div className="space-y-2">
              {friends.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  Không có bạn bè nào để thêm
                </p>
              ) : (
                friends.map((friend, index) => {
                  const uniqueKey = friend.id
                    ? `add-friend-${friend.id}`
                    : `add-friend-fallback-${index}`;
                  return (
                    <div
                      key={uniqueKey}
                      className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <img
                        src={friend.avatar_url || '/demo_avatar.jpg'}
                        alt={friend.full_name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {friend.full_name || friend.nickname || friend.email}
                        </p>
                        {friend.nickname && friend.full_name && (
                          <p className="text-xs text-gray-500">
                            @{friend.nickname}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => addMember(friend.id)}
                        className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        title="Thêm vào nhóm"
                      >
                        <FaPlus className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && isAdmin && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tên nhóm
                </label>
                <div className="flex items-center space-x-2">
                  {editingName ? (
                    <>
                      <input
                        type="text"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                      <button
                        onClick={updateGroupName}
                        className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                      >
                        <FaSave className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingName(false);
                          setNewGroupName(conversation.name || '');
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 rounded"
                      >
                        <FaTimes className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-gray-900 dark:text-white">
                        {conversation.name || 'Nhóm chat'}
                      </span>
                      <button
                        onClick={() => setEditingName(true)}
                        className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupManagementModal;
