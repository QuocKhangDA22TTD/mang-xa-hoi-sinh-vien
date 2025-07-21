import { useEffect, useState } from 'react';
import Article from '../features/newsfeed/Article';
import { getMe } from '../api/auth';
import { useParams } from 'react-router-dom';

const Button = ({ children, onClick, className }) => (
  <button onClick={onClick} className={className}>
    {children}
  </button>
);

const Avatar = ({ className, src }) => (
  <div className={className}>
    <img
      src={src}
      alt="avatar"
      className="w-full h-full object-cover rounded-full"
    />
  </div>
);

function PersonalProfile() {
  const [activeTab, setActiveTab] = useState('posts');
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const { userId } = useParams();

  useEffect(() => {
    async function fetchProfile() {
      try {
        let finalUserId = userId;
        if (!finalUserId) {
          const me = await getMe();
          finalUserId = me.id;
        }

        const res = await fetch(
          `http://localhost:5000/api/profile/${finalUserId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error('Không lấy được thông tin profile');

        const data = await res.json();
        setProfile(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchProfile();
  }, []);

  useEffect(() => {
    async function fetchPost() {
      try {
        let finalUserId = userId;
        if (!finalUserId) {
          const me = await getMe();
          finalUserId = me.id;
        }

        const res = await fetch(
          `http://localhost:5000/api/posts/${finalUserId}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!res.ok) throw new Error('Không lấy được thông tin posts');

        const data = await res.json();
        setPosts(Array.isArray(data) ? data : []);
        setPosts(data);
      } catch (err) {
        setError(err.message);
      }
    }

    fetchPost();
  }, []);

  if (error) return <p>{error}</p>;
  if (!profile) return <p>Đang tải...</p>;

  // Dữ liệu mẫu
  const profileData = {
    name: profile.full_name,
    username: profile.nickname,
    birthday: profile.birthday,
    address: profile.address,
    joinDate: profile.created_at,
    bio: profile.bio,
    avatarUrl: profile.avatar_url,
    coverUrl: '/demo_AnhBia.jpg',
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="w-[600px] bg-white rounded-[12px] shadow-lg overflow-hidden">
        {/* Cover Photo */}
        <div className="h-[160px] w-full bg-gradient-to-r from-green-400 to-blue-400 relative">
          <img
            src={profileData.coverUrl}
            alt="cover"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar positioned over cover */}
          <div className="relative -mt-12 mb-4">
            <Avatar
              className="w-[80px] h-[80px] rounded-full border-4 border-white shadow-lg"
              src={profileData.avatarUrl}
            />
          </div>

          {/* Edit Profile Button - positioned at top right */}
          <div className="flex justify-end mb-2">
            <button className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors shadow-sm">
              Sửa hồ sơ
            </button>
          </div>

          {/* Name and Username */}
          <div className="mb-6 space-y-1">
            <h2 className="text-xl font-bold text-[#262626]">
              {profileData.name}
            </h2>
            <p className="text-[#0095F6] text-base">{profileData.username}</p>
          </div>

          {/* Info Fields */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-[#8E8E8E]">Sinh nhật:</span>
              <span className="text-[#262626] text-sm">
                {profileData.birthday}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-[#8E8E8E]">Địa chỉ:</span>
              <span className="text-[#262626] text-sm">
                {profileData.address}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-sm text-[#8E8E8E]">Tham gia từ:</span>
              <span className="text-[#262626] text-sm">
                {profileData.joinDate}
              </span>
            </div>
          </div>

          {/* Bio Box */}
          <div className="bg-[#F0E5E5] rounded-[8px] p-4 mb-6">
            <p className="text-[#262626] text-sm">{profileData.bio}</p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-4">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'posts'
                    ? 'border-[#0095F6] text-[#0095F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Bài viết
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'photos'
                    ? 'border-[#0095F6] text-[#0095F6]'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Ảnh
              </button>
            </nav>
          </div>

          {/* Posts Content */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {Array.isArray(posts) && posts.length > 0 ? (
                posts.map((post) => (
                  <Article
                    key={post.id}
                    userName={post.full_name}
                    userId={post.user_id}
                    title={post.title}
                    avatarUrl={post.avatar_url}
                    createdAt={post.created_at}
                    content={post.content}
                  />
                ))
              ) : (
                <p>Người dùng chưa có bài viết nào.</p>
              )}
            </div>
          )}

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <div className="text-center py-8">
              <p className="text-gray-500">Chưa có ảnh nào được chia sẻ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PersonalProfile;
