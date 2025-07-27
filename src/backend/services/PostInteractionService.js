const db = require('../config/db');
const SocketNotificationService = require('./SocketNotificationService');

class PostInteractionService {
  /**
   * Like a post
   */
  static async likePost(postId, userId, io) {
    try {
      // Check if already liked
      const [existingLike] = await db.execute(
        'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      if (existingLike.length > 0) {
        throw new Error('Bạn đã thích bài viết này rồi');
      }

      // Add like
      await db.execute(
        'INSERT INTO likes (post_id, user_id, created_at) VALUES (?, ?, NOW())',
        [postId, userId]
      );

      // Get post info and liker info
      const [postInfo] = await db.execute(
        `SELECT p.user_id as post_owner_id, p.title, u.email as owner_email, pr.full_name as owner_name
         FROM posts p 
         JOIN users u ON p.user_id = u.id 
         LEFT JOIN profile pr ON u.id = pr.user_id 
         WHERE p.id = ?`,
        [postId]
      );

      const [likerInfo] = await db.execute(
        `SELECT u.email, pr.full_name, pr.avatar_url 
         FROM users u 
         LEFT JOIN profile pr ON u.id = pr.user_id 
         WHERE u.id = ?`,
        [userId]
      );

      // Get updated like count
      const [likeCount] = await db.execute(
        'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
        [postId]
      );

      // Send notification to post owner (if not self-like)
      if (
        postInfo.length > 0 &&
        likerInfo.length > 0 &&
        postInfo[0].post_owner_id !== userId
      ) {
        const socketService = new SocketNotificationService(io);
        await socketService.sendLikeNotification(
          postInfo[0].post_owner_id,
          {
            id: userId,
            name: likerInfo[0].full_name || likerInfo[0].email,
            email: likerInfo[0].email,
            avatar: likerInfo[0].avatar_url,
          },
          {
            postId: postId,
            title: postInfo[0].title || 'Bài viết',
          }
        );
      }

      // Broadcast real-time like update
      io.emit('post_liked', {
        postId: postId,
        userId: userId,
        likeCount: likeCount[0].count,
        liker: {
          id: userId,
          name: likerInfo[0]?.full_name || likerInfo[0]?.email,
          avatar: likerInfo[0]?.avatar_url,
        },
      });

      console.log(`👍 Post ${postId} liked by user ${userId}`);
      return { success: true, likeCount: likeCount[0].count };
    } catch (error) {
      console.error('❌ Error liking post:', error);
      throw error;
    }
  }

  /**
   * Unlike a post
   */
  static async unlikePost(postId, userId, io) {
    try {
      // Check if liked
      const [existingLike] = await db.execute(
        'SELECT id FROM likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      if (existingLike.length === 0) {
        throw new Error('Bạn chưa thích bài viết này');
      }

      // Remove like
      await db.execute('DELETE FROM likes WHERE post_id = ? AND user_id = ?', [
        postId,
        userId,
      ]);

      // Get updated like count
      const [likeCount] = await db.execute(
        'SELECT COUNT(*) as count FROM likes WHERE post_id = ?',
        [postId]
      );

      // Broadcast real-time unlike update
      io.emit('post_unliked', {
        postId: postId,
        userId: userId,
        likeCount: likeCount[0].count,
      });

      console.log(`👎 Post ${postId} unliked by user ${userId}`);
      return { success: true, likeCount: likeCount[0].count };
    } catch (error) {
      console.error('❌ Error unliking post:', error);
      throw error;
    }
  }

  /**
   * Add comment to post
   */
  static async addComment(postId, userId, content, io) {
    try {
      // Add comment
      const [result] = await db.execute(
        'INSERT INTO comments (post_id, user_id, content, created_at) VALUES (?, ?, ?, NOW())',
        [postId, userId, content]
      );

      // Get comment with user info
      const [comment] = await db.execute(
        `SELECT c.*, u.email, pr.full_name, pr.avatar_url 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         LEFT JOIN profile pr ON u.id = pr.user_id 
         WHERE c.id = ?`,
        [result.insertId]
      );

      // Get post info
      const [postInfo] = await db.execute(
        `SELECT p.user_id as post_owner_id, p.title, u.email as owner_email, pr.full_name as owner_name
         FROM posts p 
         JOIN users u ON p.user_id = u.id 
         LEFT JOIN profile pr ON u.id = pr.user_id 
         WHERE p.id = ?`,
        [postId]
      );

      // Get updated comment count
      const [commentCount] = await db.execute(
        'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
        [postId]
      );

      // Send notification to post owner (if not self-comment)
      if (postInfo.length > 0 && postInfo[0].post_owner_id !== userId) {
        const socketService = new SocketNotificationService(io);
        await socketService.sendCommentNotification(
          postInfo[0].post_owner_id,
          {
            id: userId,
            name: comment[0].full_name || comment[0].email,
            email: comment[0].email,
            avatar: comment[0].avatar_url,
          },
          {
            postId: postId,
            title: postInfo[0].title || 'Bài viết',
            commentContent: content.substring(0, 100),
          }
        );
      }

      // Broadcast real-time comment update
      io.emit('comment_added', {
        postId: postId,
        comment: {
          id: comment[0].id,
          content: comment[0].content,
          created_at: comment[0].created_at,
          user: {
            id: comment[0].user_id,
            name: comment[0].full_name || comment[0].email,
            email: comment[0].email,
            avatar: comment[0].avatar_url,
          },
        },
        commentCount: commentCount[0].count,
      });

      console.log(`💬 Comment added to post ${postId} by user ${userId}`);
      return {
        success: true,
        comment: comment[0],
        commentCount: commentCount[0].count,
      };
    } catch (error) {
      console.error('❌ Error adding comment:', error);
      throw error;
    }
  }

  /**
   * Get post interactions (likes and comments)
   */
  static async getPostInteractions(postId, userId = null) {
    try {
      // Get like count and user's like status
      const [likeData] = await db.execute(
        `SELECT 
          COUNT(*) as like_count,
          ${userId ? `SUM(CASE WHEN user_id = ${userId} THEN 1 ELSE 0 END) as user_liked` : '0 as user_liked'}
         FROM likes WHERE post_id = ?`,
        [postId]
      );

      // Get comments with user info
      const [comments] = await db.execute(
        `SELECT c.*, u.email, pr.full_name, pr.avatar_url 
         FROM comments c 
         JOIN users u ON c.user_id = u.id 
         LEFT JOIN profile pr ON u.id = pr.user_id 
         WHERE c.post_id = ? 
         ORDER BY c.created_at ASC`,
        [postId]
      );

      // Format comments
      const formattedComments = comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
        user: {
          id: comment.user_id,
          name: comment.full_name || comment.email,
          email: comment.email,
          avatar: comment.avatar_url,
        },
      }));

      const result = {
        likes: {
          count: likeData[0].like_count,
          userLiked: userId ? likeData[0].user_liked > 0 : false,
        },
        comments: {
          count: formattedComments.length,
          data: formattedComments,
        },
      };

      console.log('📊 Backend: Returning interactions:', {
        postId,
        userId,
        result,
      });

      return result;
    } catch (error) {
      console.error('❌ Error getting post interactions:', error);
      throw error;
    }
  }

  /**
   * Delete comment
   */
  static async deleteComment(commentId, userId, io) {
    try {
      // Check if comment exists and belongs to user
      const [comment] = await db.execute(
        'SELECT post_id FROM comments WHERE id = ? AND user_id = ?',
        [commentId, userId]
      );

      if (comment.length === 0) {
        throw new Error('Comment không tồn tại hoặc bạn không có quyền xóa');
      }

      const postId = comment[0].post_id;

      // Delete comment
      await db.execute('DELETE FROM comments WHERE id = ?', [commentId]);

      // Get updated comment count
      const [commentCount] = await db.execute(
        'SELECT COUNT(*) as count FROM comments WHERE post_id = ?',
        [postId]
      );

      // Broadcast real-time comment delete
      io.emit('comment_deleted', {
        postId: postId,
        commentId: commentId,
        commentCount: commentCount[0].count,
      });

      console.log(`🗑️ Comment ${commentId} deleted by user ${userId}`);
      return { success: true, commentCount: commentCount[0].count };
    } catch (error) {
      console.error('❌ Error deleting comment:', error);
      throw error;
    }
  }
}

module.exports = PostInteractionService;
