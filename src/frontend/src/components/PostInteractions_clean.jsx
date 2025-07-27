import React, { useState, useEffect } from 'react';
import { usePostInteraction } from '../context/PostInteractionContext';
import { toggleLike, addComment, deleteComment } from '../api/postInteractions';
import { useAuth } from '../context/AuthContext';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaRegComment,
  FaPaperPlane,
  FaTrash,
  FaSpinner
} from 'react-icons/fa';

const PostInteractions = ({ postId }) => {
  const { user } = useAuth();
  const { 
    loadPostInteractions, 
    getInteractions, 
    isLoading, 
    updateLikeCount,
    updateCommentCount,
    addCommentToPost,
    removeCommentFromPost 
  } = usePostInteraction();
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likingPost, setLikingPost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  const interactions = getInteractions(postId);
  const loading = isLoading(postId);

  // Debug log để kiểm tra interactions và functions
  useEffect(() => {
    console.log(`🔍 PostInteractions ${postId}:`, {
      likes: interactions.likes,
      userLiked: interactions.likes.userLiked,
      loading,
      hasUpdateLikeCount: !!updateLikeCount,
      hasLoadPostInteractions: !!loadPostInteractions,
    });
  }, [interactions, postId, loading, updateLikeCount, loadPostInteractions]);

  // Load interactions when component mounts
  useEffect(() => {
    loadPostInteractions(postId);
  }, [postId, loadPostInteractions]);

  // Handle like toggle
  const handleLikeToggle = async () => {
    if (!user || likingPost) {
      console.log('❌ Cannot toggle like:', { user: !!user, likingPost });
      return;
    }

    const currentLiked = interactions.likes.userLiked;
    const currentCount = interactions.likes.count;

    console.log(`🔄 Toggling like for post ${postId}:`, {
      userId: user.id,
      currentState: currentLiked,
      likeCount: currentCount,
    });

    setLikingPost(true);

    // Optimistic update - update UI immediately
    const newLiked = !currentLiked;
    const newCount = newLiked ? currentCount + 1 : currentCount - 1;
    
    if (updateLikeCount) {
      updateLikeCount(postId, newCount, newLiked);
      console.log(`⚡ Optimistic update:`, { newLiked, newCount });
    } else {
      console.error('❌ updateLikeCount function not available');
    }

    try {
      const result = await toggleLike(postId);
      console.log(`✅ Like toggle result:`, result);

      // Update with server response to ensure accuracy
      if (updateLikeCount) {
        updateLikeCount(postId, result.likeCount, result.liked);
      }

      // Force reload from server to ensure accuracy
      setTimeout(() => {
        console.log('🔄 Force reloading interactions from server...');
        loadPostInteractions(postId);
      }, 100);

      // Force component re-render
      setForceUpdate((prev) => prev + 1);
      
    } catch (error) {
      console.error('❌ Error toggling like:', error);
      
      // Revert optimistic update on error
      if (updateLikeCount) {
        updateLikeCount(postId, currentCount, currentLiked);
      }
      
      alert('Không thể thay đổi trạng thái thích: ' + error.message);
    } finally {
      setLikingPost(false);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user || !commentText.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      await addComment(postId, commentText.trim());
      setCommentText('');
      // Real-time update will be handled by PostInteractionContext
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      alert('Không thể thêm comment: ' + error.message);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handle comment deletion
  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    if (!confirm('Bạn có chắc muốn xóa comment này?')) return;

    try {
      await deleteComment(commentId);
      // Real-time update will be handled by PostInteractionContext
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      alert('Không thể xóa comment: ' + error.message);
    }
  };

  // Format time
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Vừa xong';
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="text-gray-500 dark:text-gray-400">
          <FaSpinner className="animate-spin inline-block mr-2" />
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div
      className="border-t border-gray-200 dark:border-gray-700 py-4"
      data-post-id={postId}
      key={`${postId}-${forceUpdate}`}
    >
      {/* Like and Comment Counts */}
      <div className="flex justify-between items-center py-3 px-1 text-sm text-gray-600 dark:text-gray-400">
        <span className="flex items-center gap-2">
          <FaHeart className="text-red-500 text-sm" />
          <span>{interactions.likes.count} lượt thích</span>
        </span>
        <span className="flex items-center gap-2">
          <FaComment className="text-blue-500 text-sm" />
          <span>{interactions.comments.count} bình luận</span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 py-2">
        {/* Like Button */}
        <button
          onClick={handleLikeToggle}
          disabled={!user || likingPost}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-medium text-sm
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${interactions.likes.userLiked 
              ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
            ${!user || likingPost ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
          title={
            !user
              ? 'Đăng nhập để thích bài viết'
              : interactions.likes.userLiked
              ? 'Bỏ thích bài viết'
              : 'Thích bài viết'
          }
        >
          {(() => {
            console.log(`🎨 Rendering like button for post ${postId}:`, {
              userLiked: interactions.likes.userLiked,
              likingPost,
              buttonClass: interactions.likes.userLiked ? 'liked' : 'not-liked',
            });

            if (likingPost) {
              return <FaSpinner className="animate-spin text-lg" />;
            } else if (interactions.likes.userLiked) {
              return <FaHeart className="text-lg text-white animate-pulse" />;
            } else {
              return <FaRegHeart className="text-lg" />;
            }
          })()}
          <span className="font-semibold">
            {interactions.likes.userLiked ? 'Đã thích' : 'Thích'}
          </span>
        </button>

        {/* Comment Button */}
        <button
          onClick={() => setShowComments(!showComments)}
          className={`
            flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-medium text-sm
            transition-all duration-300 transform hover:scale-105 active:scale-95
            ${showComments 
              ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40' 
              : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }
            cursor-pointer
          `}
        >
          {showComments ? (
            <FaComment className="text-lg text-white" />
          ) : (
            <FaRegComment className="text-lg" />
          )}
          <span className="font-semibold">Bình luận</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-2">
          {/* Add Comment Form */}
          {user && (
            <form onSubmit={handleCommentSubmit} className="mb-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-300">
                <img
                  src={user.avatar || '/default-avatar.png'}
                  alt={user.name}
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                />
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Viết bình luận..."
                  disabled={submittingComment}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim() || submittingComment}
                  className={`
                    p-2 rounded-full transition-all duration-300 transform hover:scale-110 active:scale-95
                    ${commentText.trim() && !submittingComment
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40'
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title={submittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                >
                  {submittingComment ? (
                    <FaSpinner className="animate-spin text-sm" />
                  ) : (
                    <FaPaperPlane className="text-sm" />
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Comments List */}
          <div className="max-h-96 overflow-y-auto">
            {interactions.comments.data.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 italic py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-dashed border-gray-300 dark:border-gray-600">
                Chưa có bình luận nào
              </p>
            ) : (
              interactions.comments.data.map((comment) => (
                <div key={comment.id} className="flex gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300">
                  <img
                    src={comment.user.avatar || '/default-avatar.png'}
                    alt={comment.user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-gray-300 dark:border-gray-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">
                        {comment.user.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatTime(comment.created_at)}
                      </span>
                      {user && user.id === comment.user.id && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="ml-auto p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300"
                          title="Xóa comment"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostInteractions;
