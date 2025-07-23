import DOMPurify from 'dompurify';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FaThumbsUp,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaHeart,
  FaBookmark,
} from 'react-icons/fa';

function Article({ userName, userId, title, avatarUrl, createdAt, content }) {
  const safeContent = DOMPurify.sanitize(content);
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(24);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <article className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 transition-colors overflow-hidden">
      {/* Post Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(`/persona-profile/${userId}`)}
            className="flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2 -m-2 transition-colors"
          >
            <img
              className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-600"
              src={avatarUrl || '/demo_avatar.jpg'}
              alt={`${userName}'s avatar`}
            />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {userName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {formatDate(createdAt)}
              </p>
            </div>
          </button>
        </div>

        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
          <FaEllipsisH className="w-5 h-5" />
        </button>
      </div>

      {/* Post Content */}
      <div className="px-6 pb-4">
        {title && (
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3 leading-tight">
            {title}
          </h2>
        )}

        <div
          className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: safeContent }}
        />
      </div>

      {/* Engagement Stats */}
      <div className="px-6 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <FaHeart className="w-4 h-4 text-red-500" />
              <span>{likeCount} lượt thích</span>
            </span>
            <span>12 bình luận</span>
            <span>3 chia sẻ</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-around">
          <button
            onClick={handleLike}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              liked
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FaThumbsUp className={`w-5 h-5 ${liked ? 'text-blue-600' : ''}`} />
            <span className="font-medium">Thích</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <FaComment className="w-5 h-5" />
            <span className="font-medium">Bình luận</span>
          </button>

          <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <FaShare className="w-5 h-5" />
            <span className="font-medium">Chia sẻ</span>
          </button>

          <button
            onClick={() => setSaved(!saved)}
            className={`p-2 rounded-lg transition-colors ${
              saved
                ? 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <FaBookmark className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="space-y-3">
            <div className="flex space-x-3">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src="/demo_avatar.jpg"
                alt="Commenter"
              />
              <div className="flex-1">
                <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-2">
                  <p className="text-sm text-gray-900 dark:text-white">
                    <span className="font-semibold">Nguyễn Văn A</span> Bài viết
                    rất hay!
                  </p>
                </div>
                <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                  <button className="hover:text-gray-700 dark:hover:text-gray-300">
                    Thích
                  </button>
                  <button className="hover:text-gray-700 dark:hover:text-gray-300">
                    Trả lời
                  </button>
                  <span>2 giờ trước</span>
                </div>
              </div>
            </div>

            {/* Add Comment */}
            <div className="flex space-x-3 mt-4">
              <img
                className="w-8 h-8 rounded-full object-cover"
                src="/demo_avatar.jpg"
                alt="Your avatar"
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default Article;
