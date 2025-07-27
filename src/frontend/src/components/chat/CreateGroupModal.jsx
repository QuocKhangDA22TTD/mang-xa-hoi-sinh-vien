import { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaPlus, FaCheck } from 'react-icons/fa';
import { getFriends } from '../../api/friends';
import { createConversation } from '../../api/chat';

function CreateGroupModal({ isOpen, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      setGroupName('');
      setSelectedMembers([]);
      setError(null);
    }
  }, [isOpen]);

  const loadFriends = async () => {
    try {
      setLoadingFriends(true);
      console.log('🔍 CreateGroupModal - Loading friends...');

      const data = await getFriends();
      console.log('🔍 CreateGroupModal - Friends data received:', data);
      console.log('🔍 CreateGroupModal - Friends count:', data?.length || 0);

      if (data && Array.isArray(data)) {
        // Map backend field names to frontend expected names
        const mappedFriends = data.map((friend) => ({
          id: friend.friend_id,
          full_name: friend.friend_name,
          email: friend.friend_email,
          avatar_url: friend.friend_avatar,
          nickname: friend.friend_name, // Use full_name as nickname fallback
          is_online: friend.is_online,
          last_active: friend.last_active,
        }));

        console.log('🔍 CreateGroupModal - Mapped friends:', mappedFriends);
        setFriends(mappedFriends);
        console.log('✅ CreateGroupModal - Friends loaded successfully');
      } else {
        console.warn('⚠️ CreateGroupModal - Invalid friends data format');
        setFriends([]);
      }
    } catch (error) {
      console.error('❌ CreateGroupModal - Error loading friends:', error);
      setError('Không thể tải danh sách bạn bè: ' + error.message);
    } finally {
      setLoadingFriends(false);
    }
  };

  const toggleMember = (friendId) => {
    setSelectedMembers((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      setError('Vui lòng nhập tên nhóm');
      return;
    }

    if (selectedMembers.length === 0) {
      setError('Vui lòng chọn ít nhất 1 thành viên');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const groupData = {
        is_group: true,
        name: groupName.trim(),
        member_ids: selectedMembers,
      };

      const newGroup = await createConversation(groupData);
      onGroupCreated(newGroup);
      onClose();
    } catch (error) {
      console.error('Lỗi khi tạo nhóm:', error);
      setError(error.message || 'Không thể tạo nhóm');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FaUsers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Tạo nhóm chat
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Group Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên nhóm
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Nhập tên nhóm..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          {/* Members Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Chọn thành viên ({selectedMembers.length} đã chọn)
            </label>

            {loadingFriends ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">
                  Đang tải danh sách bạn bè...
                </p>
              </div>
            ) : friends.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Bạn chưa có bạn bè nào
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {friends.map((friend, index) => {
                  const uniqueKey = friend.id
                    ? `friend-${friend.id}`
                    : `friend-fallback-${index}`;
                  return (
                    <div
                      key={uniqueKey}
                      onClick={() => toggleMember(friend.id)}
                      className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedMembers.includes(friend.id)
                          ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <img
                        src={friend.avatar_url || '/demo_avatar.jpg'}
                        alt={friend.full_name}
                        className="w-8 h-8 rounded-full object-cover"
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
                      {selectedMembers.includes(friend.id) && (
                        <FaCheck className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Hủy
          </button>
          <button
            onClick={handleCreateGroup}
            disabled={
              loading || !groupName.trim() || selectedMembers.length === 0
            }
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang tạo...</span>
              </>
            ) : (
              <>
                <FaPlus className="w-4 h-4" />
                <span>Tạo nhóm</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateGroupModal;
