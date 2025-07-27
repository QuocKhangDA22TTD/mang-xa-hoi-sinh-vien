import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Article from '../features/newsfeed/Article';
import { getMe } from '../api/auth';
import {
  FaEdit,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserPlus,
  FaArrowLeft,
  FaCog,
  FaCamera,
} from 'react-icons/fa';

function PersonalProfile() {
  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [loading, setLoading] = useState(true);
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const currentUser = await getMe();
        const targetUserId = userId || currentUser.id;

        // Check if viewing own profile
        setIsOwnProfile(!userId || userId === currentUser.id.toString());

        const response = await fetch(
          `https://daring-embrace-production.up.railway.app/api/profile/${targetUserId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!response.ok) {
          throw new Error('Không thể tải thông tin profile');
        }

        const profileData = await response.json();
        setProfile(profileData);

        // Fetch posts
        const postsResponse = await fetch(
          `https://daring-embrace-production.up.railway.app/api/posts/user/${targetUserId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (postsResponse.ok) {
          const postsData = await postsResponse.json();
          setPosts(Array.isArray(postsData) ? postsData : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Đang tải profile...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const profileData = {
    name: profile.full_name,
    username: profile.nickname,
    birthday: profile.birthday,
    address: profile.address,
    joinDate: profile.created_at,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    coverUrl: profile.banner_url || '/demo_AnhBia.jpg',
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      <div className="max-w-4xl mx-auto">
        {/* Cover Photo */}
        <div className="relative h-80 bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700">
          <img
            src={profileData.coverUrl}
            alt="Cover"
            className="w-full h-full object-cover"
          />

          {/* Cover overlay for better text readability */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Back button */}
          {userId && (
            <button
              onClick={() => navigate(-1)}
              className="absolute top-6 left-6 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <FaArrowLeft className="w-5 h-5" />
            </button>
          )}

          {/* Cover photo edit button */}
          {isOwnProfile && (
            <button className="absolute bottom-6 right-6 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors">
              <FaCamera className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 transition-colors">
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-20 mb-6">
              <div className="relative inline-block">
                <img
                  src={profileData.avatarUrl || '/demo_avatar.jpg'}
                  alt="Profile"
                  className="w-40 h-40 rounded-full border-6 border-white dark:border-gray-800 shadow-xl object-cover"
                />
                {isOwnProfile && (
                  <button className="absolute bottom-2 right-2 p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors">
                    <FaCamera className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Profile Info & Actions */}
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  @{profileData.username}
                </p>

                {profileData.bio && (
                  <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                    {profileData.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>
                      Sinh nhật:{' '}
                      {new Date(profileData.birthday).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span>{profileData.address}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FaCalendarAlt className="w-4 h-4" />
                    <span>
                      Tham gia{' '}
                      {new Date(profileData.joinDate).toLocaleDateString(
                        'vi-VN'
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 mt-6 lg:mt-0">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => navigate('/update-profile')}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                      <span>Chỉnh sửa profile</span>
                    </button>
                    <button className="p-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <FaCog className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                      <FaUserPlus className="w-4 h-4" />
                      <span>Kết bạn</span>
                    </button>
                    <button className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      Nhắn tin
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 transition-colors">
          <div className="px-6">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'posts'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Bài viết ({posts.length})
              </button>
              <button
                onClick={() => setActiveTab('about')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'about'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Giới thiệu
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'photos'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                Ảnh
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {posts.length > 0 ? (
                  posts.map((post) => (
                    <Article
                      key={post.id}
                      userName={post.author_name || post.full_name}
                      userId={post.author_id || post.user_id}
                      title={post.title}
                      avatarUrl={post.author_avatar || post.avatar_url}
                      createdAt={post.created_at}
                      content={post.content}
                    />
                  ))
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center transition-colors">
                    <div className="text-gray-400 dark:text-gray-500 mb-4">
                      <FaEdit className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Chưa có bài viết nào
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      {isOwnProfile
                        ? 'Hãy chia sẻ suy nghĩ đầu tiên của bạn!'
                        : 'Người dùng này chưa chia sẻ bài viết nào.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'about' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 transition-colors">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Thông tin cá nhân
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        Họ tên
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {profileData.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tên người dùng
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        @{profileData.username}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        Sinh nhật
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(profileData.birthday).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">
                        Địa chỉ
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {profileData.address}
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">
                        Tham gia
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {new Date(profileData.joinDate).toLocaleDateString(
                          'vi-VN'
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {profileData.bio && (
                  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 transition-colors">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                      Giới thiệu
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                      {profileData.bio}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'photos' && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center transition-colors">
                <div className="text-gray-400 dark:text-gray-500 mb-4">
                  <FaCamera className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Chưa có ảnh nào
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isOwnProfile
                    ? 'Hãy chia sẻ những khoảnh khắc đẹp của bạn!'
                    : 'Người dùng này chưa chia sẻ ảnh nào.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PersonalProfile;
