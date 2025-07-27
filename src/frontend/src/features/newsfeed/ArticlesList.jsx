import { useEffect, useState } from 'react';
import Article from './Article';
import { FaEdit, FaSpinner } from 'react-icons/fa';

function ArticlesList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://daring-embrace-production.up.railway.app/api/posts/', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Không thể tải bài viết');
        }

        const data = await response.json();
        setPosts(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message);
        console.error('Lỗi khi fetch:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <FaSpinner className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Đang tải bài viết...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center transition-colors">
        <div className="text-red-500 mb-4">
          <FaEdit className="w-12 h-12 mx-auto" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Không thể tải bài viết
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Thử lại
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center transition-colors">
        <div className="text-gray-400 dark:text-gray-500 mb-4">
          <FaEdit className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Chưa có bài viết nào
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Hãy là người đầu tiên chia sẻ suy nghĩ của bạn!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Article
          key={post.id}
          postId={post.id}
          title={post.title}
          userName={post.full_name}
          userId={post.user_id}
          avatarUrl={post.avatar_url}
          createdAt={post.created_at}
          content={post.content}
        />
      ))}
    </div>
  );
}

export default ArticlesList;
