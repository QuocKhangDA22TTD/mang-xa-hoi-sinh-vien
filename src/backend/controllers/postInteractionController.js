const PostInteractionService = require('../services/PostInteractionService');

// Like a post
exports.likePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    console.log(`👍 User ${userId} attempting to like post ${postId}`);

    const result = await PostInteractionService.likePost(postId, userId, req.io);
    
    res.json({
      message: 'Đã thích bài viết',
      likeCount: result.likeCount,
    });
  } catch (error) {
    console.error('❌ Error in likePost controller:', error);
    if (error.message === 'Bạn đã thích bài viết này rồi') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server khi thích bài viết' });
  }
};

// Unlike a post
exports.unlikePost = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    console.log(`👎 User ${userId} attempting to unlike post ${postId}`);

    const result = await PostInteractionService.unlikePost(postId, userId, req.io);
    
    res.json({
      message: 'Đã bỏ thích bài viết',
      likeCount: result.likeCount,
    });
  } catch (error) {
    console.error('❌ Error in unlikePost controller:', error);
    if (error.message === 'Bạn chưa thích bài viết này') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server khi bỏ thích bài viết' });
  }
};

// Add comment to post
exports.addComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Nội dung comment không được để trống' });
    }

    console.log(`💬 User ${userId} adding comment to post ${postId}`);

    const result = await PostInteractionService.addComment(postId, userId, content.trim(), req.io);
    
    res.json({
      message: 'Đã thêm comment',
      comment: result.comment,
      commentCount: result.commentCount,
    });
  } catch (error) {
    console.error('❌ Error in addComment controller:', error);
    res.status(500).json({ message: 'Lỗi server khi thêm comment' });
  }
};

// Get post interactions (likes and comments)
exports.getPostInteractions = async (req, res) => {
  try {
    const postId = req.params.postId;
    const userId = req.user ? req.user.id : null;

    console.log(`📊 Getting interactions for post ${postId}`);

    const interactions = await PostInteractionService.getPostInteractions(postId, userId);
    
    res.json(interactions);
  } catch (error) {
    console.error('❌ Error in getPostInteractions controller:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông tin tương tác' });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const userId = req.user.id;
    const commentId = req.params.commentId;

    console.log(`🗑️ User ${userId} attempting to delete comment ${commentId}`);

    const result = await PostInteractionService.deleteComment(commentId, userId, req.io);
    
    res.json({
      message: 'Đã xóa comment',
      commentCount: result.commentCount,
    });
  } catch (error) {
    console.error('❌ Error in deleteComment controller:', error);
    if (error.message.includes('không tồn tại') || error.message.includes('không có quyền')) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi server khi xóa comment' });
  }
};

// Toggle like (like if not liked, unlike if liked)
exports.toggleLike = async (req, res) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    console.log(`🔄 User ${userId} toggling like for post ${postId}`);

    // Check current like status
    const interactions = await PostInteractionService.getPostInteractions(postId, userId);
    
    let result;
    if (interactions.likes.userLiked) {
      // Unlike
      result = await PostInteractionService.unlikePost(postId, userId, req.io);
      res.json({
        message: 'Đã bỏ thích bài viết',
        liked: false,
        likeCount: result.likeCount,
      });
    } else {
      // Like
      result = await PostInteractionService.likePost(postId, userId, req.io);
      res.json({
        message: 'Đã thích bài viết',
        liked: true,
        likeCount: result.likeCount,
      });
    }
  } catch (error) {
    console.error('❌ Error in toggleLike controller:', error);
    res.status(500).json({ message: 'Lỗi server khi thay đổi trạng thái thích' });
  }
};
