import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FaHome, 
  FaSignOutAlt, 
  FaArrowLeft,
  FaUser,
  FaComments,
  FaBell
} from 'react-icons/fa';

const NavigationHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const isHomePage = location.pathname === '/';
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  // Don't show navigation on login/register pages
  if (isLoginPage || isRegisterPage) {
    return null;
  }

  const handleLogout = async () => {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
      try {
        await logout();
        navigate('/login');
      } catch (error) {
        console.error('❌ Logout error:', error);
        alert('Lỗi khi đăng xuất: ' + error.message);
      }
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Trang chủ';
      case '/profile':
        return 'Hồ sơ cá nhân';
      case '/chat':
        return 'Tin nhắn';
      case '/notifications':
        return 'Thông báo';
      default:
        if (location.pathname.startsWith('/profile/')) {
          return 'Hồ sơ người dùng';
        }
        return 'Mạng xã hội sinh viên';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side - Back/Home button */}
          <div className="flex items-center gap-3">
            {!isHomePage ? (
              <button
                onClick={handleGoBack}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                title="Quay lại"
              >
                <FaArrowLeft className="text-lg" />
              </button>
            ) : null}
            
            <button
              onClick={handleGoHome}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                isHomePage 
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' 
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
              title="Trang chủ"
            >
              <FaHome className="text-lg" />
            </button>
          </div>

          {/* Center - Page title */}
          <div className="flex-1 text-center">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right side - User info and logout */}
          <div className="flex items-center gap-3">
            {user && (
              <>
                {/* User avatar and name */}
                <div className="flex items-center gap-2">
                  <img
                    src={user.avatar || '/default-avatar.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  <span className="hidden sm:block text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </span>
                </div>

                {/* Navigation buttons for home page */}
                {isHomePage && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('/profile')}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                      title="Hồ sơ cá nhân"
                    >
                      <FaUser className="text-lg" />
                    </button>
                    
                    <button
                      onClick={() => navigate('/chat')}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                      title="Tin nhắn"
                    >
                      <FaComments className="text-lg" />
                    </button>
                    
                    <button
                      onClick={() => navigate('/notifications')}
                      className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 transform hover:scale-105"
                      title="Thông báo"
                    >
                      <FaBell className="text-lg" />
                    </button>
                  </div>
                )}

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-full bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/40 transition-all duration-300 transform hover:scale-105"
                  title="Đăng xuất"
                >
                  <FaSignOutAlt className="text-lg" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavigationHeader;
