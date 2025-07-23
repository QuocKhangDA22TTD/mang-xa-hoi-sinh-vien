import { useNavigate } from 'react-router-dom';
import useUserProfile from '../../hooks/useUserProfile';
import {
  FaHome,
  FaFire,
  FaHeart,
  FaClock,
  FaTrophy,
  FaUsers,
  FaComments,
  FaBookmark,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';

function LeftBar() {
  const { profile, loading } = useUserProfile();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="p-6 animate-pulse">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-300 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const navigationItems = [
    { icon: FaHome, label: 'Trang chủ', path: '/', active: true },
    { icon: FaFire, label: 'Thịnh hành', path: '/trending' },
    { icon: FaHeart, label: 'Yêu thích', path: '/favorites' },
    { icon: FaClock, label: 'Gần đây', path: '/recent' },
    { icon: FaTrophy, label: 'Top bài viết', path: '/top-posts' },
  ];

  const quickActions = [
    {
      icon: FaUsers,
      label: 'Bạn bè',
      path: '/friends',
      color: 'text-blue-600',
    },
    {
      icon: FaComments,
      label: 'Tin nhắn',
      path: '/chat',
      color: 'text-green-600',
    },
    {
      icon: FaBookmark,
      label: 'Đã lưu',
      path: '/saved',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* User Profile Section */}
      <button
        onClick={() => navigate('/profile')}
        className="w-full flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-xl border border-blue-100 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800/50 dark:hover:to-indigo-800/50 transition-all duration-200 group"
      >
        <img
          className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200 dark:ring-blue-600 group-hover:ring-blue-300 dark:group-hover:ring-blue-500 transition-all"
          src={profile.avatar_url || '/demo_avatar.jpg'}
          alt="Profile"
        />
        <div className="flex-1 min-w-0 text-left">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
            {profile.full_name || 'Người dùng'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
            {profile.bio || 'Xem profile của bạn'}
          </p>
        </div>
      </button>

      {/* Navigation Menu */}
      <nav className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
          Điều hướng
        </h4>
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                item.active
                  ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-medium'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3">
          Truy cập nhanh
        </h4>
        {quickActions.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              onClick={() => navigate(item.path)}
              className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
            >
              <Icon className={`w-5 h-5 ${item.color} dark:brightness-125`} />
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Settings & Logout */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white transition-all duration-200">
          <FaCog className="w-5 h-5" />
          <span className="text-sm">Cài đặt</span>
        </button>
        <button className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200">
          <FaSignOutAlt className="w-5 h-5" />
          <span className="text-sm">Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

export default LeftBar;
