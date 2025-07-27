const db = require('../config/db');

class NotificationService {
  /**
   * Create a new notification
   * @param {Object} notificationData
   * @param {number} notificationData.userId - Recipient user ID
   * @param {string} notificationData.type - Notification type
   * @param {string} notificationData.title - Notification title
   * @param {string} notificationData.content - Notification content
   * @param {Object} notificationData.data - Additional data (optional)
   * @returns {Promise<Object>} Created notification
   */
  static async createNotification({
    userId,
    type,
    title,
    content,
    data = null,
  }) {
    try {
      const [result] = await db.execute(
        `INSERT INTO notifications (user_id, type, title, content, data, created_at) 
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [userId, type, title, content, JSON.stringify(data)]
      );

      const [notification] = await db.execute(
        `SELECT * FROM notifications WHERE id = ?`,
        [result.insertId]
      );

      console.log(`📝 Notification created for user ${userId}:`, {
        id: result.insertId,
        type,
        title,
      });

      return notification[0];
    } catch (error) {
      console.error('❌ Error creating notification:', error);
      throw error;
    }
  }

  /**
   * Create friend request notification
   */
  static async createFriendRequestNotification(receiverId, senderData) {
    return this.createNotification({
      userId: receiverId,
      type: 'friend_request',
      title: 'Lời mời kết bạn mới',
      content: `${senderData.name} đã gửi lời mời kết bạn`,
      data: {
        senderId: senderData.id,
        senderName: senderData.name,
        senderEmail: senderData.email,
        senderAvatar: senderData.avatar,
      },
    });
  }

  /**
   * Create friend accepted notification
   */
  static async createFriendAcceptedNotification(senderId, accepterData) {
    return this.createNotification({
      userId: senderId,
      type: 'friend_accepted',
      title: 'Lời mời được chấp nhận',
      content: `${accepterData.name} đã chấp nhận lời mời kết bạn`,
      data: {
        accepterId: accepterData.id,
        accepterName: accepterData.name,
        accepterEmail: accepterData.email,
        accepterAvatar: accepterData.avatar,
      },
    });
  }

  /**
   * Create friend declined notification
   */
  static async createFriendDeclinedNotification(senderId, declinerData) {
    return this.createNotification({
      userId: senderId,
      type: 'friend_declined',
      title: 'Lời mời bị từ chối',
      content: `${declinerData.name} đã từ chối lời mời kết bạn`,
      data: {
        declinerId: declinerData.id,
        declinerName: declinerData.name,
        declinerEmail: declinerData.email,
        declinerAvatar: declinerData.avatar,
      },
    });
  }

  /**
   * Create message notification
   */
  static async createMessageNotification(receiverId, senderData, messageData) {
    return this.createNotification({
      userId: receiverId,
      type: 'message',
      title: 'Tin nhắn mới',
      content: `${senderData.name}: ${messageData.content.substring(0, 50)}${
        messageData.content.length > 50 ? '...' : ''
      }`,
      data: {
        senderId: senderData.id,
        senderName: senderData.name,
        senderAvatar: senderData.avatar,
        conversationId: messageData.conversationId,
        messageId: messageData.messageId,
        messageContent: messageData.content,
      },
    });
  }

  /**
   * Create comment notification
   */
  static async createCommentNotification(postOwnerId, commenterData, postData) {
    return this.createNotification({
      userId: postOwnerId,
      type: 'comment',
      title: 'Bình luận mới',
      content: `${commenterData.name} đã bình luận bài viết của bạn`,
      data: {
        commenterId: commenterData.id,
        commenterName: commenterData.name,
        commenterAvatar: commenterData.avatar,
        postId: postData.postId,
        postTitle: postData.title,
        commentContent: postData.commentContent,
      },
    });
  }

  /**
   * Create like notification
   */
  static async createLikeNotification(postOwnerId, likerData, postData) {
    return this.createNotification({
      userId: postOwnerId,
      type: 'like',
      title: 'Lượt thích mới',
      content: `${likerData.name} đã thích bài viết của bạn`,
      data: {
        likerId: likerData.id,
        likerName: likerData.name,
        likerAvatar: likerData.avatar,
        postId: postData.postId,
        postTitle: postData.title,
      },
    });
  }

  /**
   * Get notifications for a user
   */
  static async getUserNotifications(userId, limit = 20, offset = 0) {
    try {
      const [notifications] = await db.execute(
        `SELECT * FROM notifications 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT ? OFFSET ?`,
        [userId, limit, offset]
      );

      // Parse JSON data
      return notifications.map((notification) => ({
        ...notification,
        data: notification.data ? JSON.parse(notification.data) : null,
      }));
    } catch (error) {
      console.error('❌ Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId, userId) {
    try {
      await db.execute(
        `UPDATE notifications SET is_read = TRUE, updated_at = NOW() 
         WHERE id = ? AND user_id = ?`,
        [notificationId, userId]
      );
      console.log(`✅ Notification ${notificationId} marked as read`);
    } catch (error) {
      console.error('❌ Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId) {
    try {
      await db.execute(
        `UPDATE notifications SET is_read = TRUE, updated_at = NOW() 
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
      console.log(`✅ All notifications marked as read for user ${userId}`);
    } catch (error) {
      console.error('❌ Error marking all notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  static async getUnreadCount(userId) {
    try {
      const [result] = await db.execute(
        `SELECT COUNT(*) as count FROM notifications 
         WHERE user_id = ? AND is_read = FALSE`,
        [userId]
      );
      return result[0].count;
    } catch (error) {
      console.error('❌ Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Delete old notifications (cleanup)
   */
  static async deleteOldNotifications(daysOld = 30) {
    try {
      await db.execute(
        `DELETE FROM notifications 
         WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)`,
        [daysOld]
      );
      console.log(`🧹 Deleted notifications older than ${daysOld} days`);
    } catch (error) {
      console.error('❌ Error deleting old notifications:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;
