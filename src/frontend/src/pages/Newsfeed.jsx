import ArticlesList from '../features/newsfeed/ArticlesList';
import useUserProfile from '../hooks/useUserProfile';
import { FaEdit, FaImage, FaVideo, FaSmile } from 'react-icons/fa';

function Newsfeed({ onCreatePost }) {
  const { profile, loading } = useUserProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-300">
          Đang tải bài viết...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 transition-colors">
        <div className="flex items-center space-x-4">
          <img
            className="w-12 h-12 rounded-full object-cover ring-2 ring-blue-200 dark:ring-blue-600"
            src={profile.avatar_url || '/demo_avatar.jpg'}
            alt="Your avatar"
          />
          <button
            onClick={onCreatePost}
            className="flex-1 text-left px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all duration-200"
          >
            Bạn đang nghĩ gì, {profile.full_name?.split(' ')[0] || 'bạn'}?
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCreatePost}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaEdit className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium">Viết bài</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FaImage className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium">Ảnh</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FaVideo className="w-5 h-5 text-red-500" />
            <span className="text-sm font-medium">Video</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FaSmile className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium">Cảm xúc</span>
          </button>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-6">
        <ArticlesList />
      </div>
    </div>
  );
}

export default Newsfeed;
