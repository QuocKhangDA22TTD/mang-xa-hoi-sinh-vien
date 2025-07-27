import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '../api/auth';
import LeftBar from '../features/newsfeed/LeftBar';
import Content from '../features/newsfeed/Content';
import RightBar from '../features/newsfeed/RightBar';
import { useTheme } from '../contexts/ThemeContext';
import NotificationToast from '../components/notifications/NotificationToast';

function HomePage() {
  const [currentView, setCurrentView] = useState('newsfeed');
  const [isChecking, setIsChecking] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const { isDark } = useTheme();

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
          if (res.status === 404) {
            navigate('/create-profile');
            return;
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const profileData = await res.json();
        console.log('Profile data:', profileData);
      } catch (error) {
        console.error('Error checking profile:', error);
        if (error.message.includes('404')) {
          navigate('/create-profile');
        }
      } finally {
        setIsChecking(false);
      }
    };

    checkProfile();
  }, [navigate]);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Đang kiểm tra hồ sơ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 transition-colors">
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
            <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
              <Content currentView={currentView} setCurrentView={setCurrentView} />
            </div>
          </main>

          {/* Right Sidebar - Desktop */}
          <aside className="hidden xl:block xl:w-80 flex-shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
                <RightBar />
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Floating Action Button - Mobile */}
      <div className="lg:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => navigate('/create-post')}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-110 transition-all duration-300"
          title="Tạo bài viết mới"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl"></div>
      </div>

      {/* Notification Toasts */}
      <NotificationToast />
    </div>
  );
}

export default HomePage;
