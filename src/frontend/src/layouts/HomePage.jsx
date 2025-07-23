import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getMe } from '../api/auth';
import LeftBar from '../features/newsfeed/LeftBar';
import Content from '../features/newsfeed/Content';
import RightBar from '../features/newsfeed/RightBar';
import { useTheme } from '../contexts/ThemeContext';
import {
  FaSearch,
  FaBell,
  FaUserCircle,
  FaUsers,
  FaComments,
  FaPlus,
  FaCog,
  FaMoon,
  FaSun,
  FaTimes,
} from 'react-icons/fa';

function HomePage() {
  const [currentView, setCurrentView] = useState('newsfeed');
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const userData = await getMe();
        setUser(userData);

        const res = await fetch(
          `http://localhost:5000/api/profile/${userData.id}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
          }
        );

        if (!res.ok) {
          navigate('/create-profile');
          return;
        }
      } catch (err) {
        console.warn('Lỗi khi kiểm tra profile:', err);
        navigate('/create-profile');
        return;
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [navigate]);

  // Reset currentView khi có refresh state từ CreatePostPage
  useEffect(() => {
    if (location.state?.refresh) {
      setCurrentView('newsfeed');
    }
  }, [location.state?.refresh]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  {/* Logo Icon */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H19V9ZM12 7C14.76 7 17 9.24 17 12S14.76 17 12 17 7 14.76 7 12 9.24 7 12 7ZM12 9C10.34 9 9 10.34 9 12S10.34 15 12 15 15 13.66 15 12 13.66 9 12 9Z" />
                      </svg>
                    </div>
                    {/* Decorative dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Search Bar - Desktop */}
            <div className="hidden md:block flex-1 max-w-lg mx-8">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bài viết, bạn bè..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSearchResults(true)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-96 overflow-y-auto">
                    {searchQuery ? (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Kết quả tìm kiếm
                          </h3>
                          <button
                            onClick={() => setShowSearchResults(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <FaUsers className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Tìm kiếm người dùng: "{searchQuery}"
                              </span>
                            </div>
                          </div>
                          <div className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <FaSearch className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                Tìm kiếm bài viết: "{searchQuery}"
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Tìm kiếm gần đây
                          </h3>
                          <button
                            onClick={() => setShowSearchResults(false)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-2">
                          {recentSearches.length > 0 ? (
                            recentSearches.map((search, index) => (
                              <div
                                key={`search-${search}-${index}`}
                                className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
                              >
                                <div className="flex items-center space-x-3">
                                  <FaSearch className="w-4 h-4 text-gray-400" />
                                  <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {search}
                                  </span>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              Chưa có tìm kiếm gần đây
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                title={
                  isDark ? 'Chuyển sang Light Mode' : 'Chuyển sang Dark Mode'
                }
              >
                {isDark ? (
                  <FaSun className="w-5 h-5" />
                ) : (
                  <FaMoon className="w-5 h-5" />
                )}
              </button>

              {/* Notifications */}
              <button className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                <FaBell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>

              {/* Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-2 p-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <img
                  src="/demo_avatar.jpg"
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                />
                {user && (
                  <span className="hidden md:block text-sm font-medium">
                    {user.email?.split('@')[0]}
                  </span>
                )}
              </button>

              {/* Settings */}
              <button
                onClick={() => navigate('/settings')}
                className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <FaCog className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                <LeftBar />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="max-w-2xl mx-auto lg:max-w-none space-y-6">
              {/* Quick Actions - Mobile */}
              <div className="lg:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="grid grid-cols-4 gap-4">
                  <button
                    onClick={() => navigate('/create-post')}
                    className="flex flex-col items-center p-3 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                  >
                    <FaPlus className="w-6 h-6 text-blue-600 mb-1" />
                    <span className="text-xs text-blue-600 font-medium">
                      Tạo
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/friends')}
                    className="flex flex-col items-center p-3 bg-green-50 hover:bg-green-100 rounded-xl transition-colors"
                  >
                    <FaUsers className="w-6 h-6 text-green-600 mb-1" />
                    <span className="text-xs text-green-600 font-medium">
                      Bạn bè
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/chat')}
                    className="flex flex-col items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    <FaComments className="w-6 h-6 text-purple-600 mb-1" />
                    <span className="text-xs text-purple-600 font-medium">
                      Chat
                    </span>
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className="flex flex-col items-center p-3 bg-orange-50 hover:bg-orange-100 rounded-xl transition-colors"
                  >
                    <FaUserCircle className="w-6 h-6 text-orange-600 mb-1" />
                    <span className="text-xs text-orange-600 font-medium">
                      Profile
                    </span>
                  </button>
                </div>
              </div>

              {/* Search Bar - Mobile */}
              <div className="md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-4 transition-colors">
                <div className="relative">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>

              {/* Main Content */}
              <Content
                currentView={currentView}
                setCurrentView={setCurrentView}
              />
            </div>
          </main>

          {/* Right Sidebar - Desktop */}
          <aside className="hidden lg:block lg:w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                <RightBar />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button - Desktop */}
      <div className="hidden lg:block fixed bottom-8 right-8 z-40">
        <button
          onClick={() => navigate('/create-post')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300 group"
        >
          <FaPlus className="w-6 h-6" />
          <span className="absolute right-16 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Tạo bài viết mới
          </span>
        </button>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/5 to-indigo-600/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-gradient-to-r from-purple-400/3 to-pink-600/3 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
}

export default HomePage;
