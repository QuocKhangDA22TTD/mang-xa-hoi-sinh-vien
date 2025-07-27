const NotificationService = require('./NotificationService');

class SocketNotificationService {
  constructor(io) {
    this.io = io;
  }

  /**
   * Send real-time notification to user
   * @param {number} userId - Target user ID
   * @param {Object} notificationData - Notification data
   */
  async sendNotification(userId, notificationData) {
    try {
      // Save to database
      const savedNotification =
        await NotificationService.createNotification(notificationData);

      // Send real-time notification
      this.io.to(`user_${userId}`).emit('notification_received', {
        ...savedNotification,
        data: savedNotification.data
          ? typeof savedNotification.data === 'string'
            ? JSON.parse(savedNotification.data)
            : savedNotification.data
          : null,
      });

      console.log(`📡 Real-time notification sent to user ${userId}`);
      return savedNotification;
    } catch (error) {
      console.error('❌ Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send friend request notification
   */
  async sendFriendRequestNotification(receiverId, senderData) {
    const notificationData = {
      userId: receiverId,
      type: 'friend_request',
      title: 'Lời mời kết bạn mới',
      content: `${senderData.name} đã gửi lời mời kết bạn`,
      data: {
        senderId: senderData.id,
        senderName: senderData.name,
        senderEmail: senderData.email,
        senderAvatar: senderData.avatar,
        actionUrl: '/friends?tab=received',
      },
    };

    return this.sendNotification(receiverId, notificationData);
  }

  /**
   * Send friend accepted notification
   */
  async sendFriendAcceptedNotification(senderId, accepterData) {
    const notificationData = {
      userId: senderId,
      type: 'friend_accepted',
      title: 'Lời mời được chấp nhận',
      content: `${accepterData.name} đã chấp nhận lời mời kết bạn`,
      data: {
        accepterId: accepterData.id,
        accepterName: accepterData.name,
        accepterEmail: accepterData.email,
        accepterAvatar: accepterData.avatar,
        actionUrl: '/friends',
      },
    };

    return this.sendNotification(senderId, notificationData);
  }

  /**
   * Send friend declined notification
   */
  async sendFriendDeclinedNotification(senderId, declinerData) {
    const notificationData = {
      userId: senderId,
      type: 'friend_declined',
      title: 'Lời mời bị từ chối',
      content: `${declinerData.name} đã từ chối lời mời kết bạn`,
      data: {
        declinerId: declinerData.id,
        declinerName: declinerData.name,
        declinerEmail: declinerData.email,
        declinerAvatar: declinerData.avatar,
        actionUrl: '/friends?tab=sent',
      },
    };

    return this.sendNotification(senderId, notificationData);
  }

  /**
   * Send message notification
   */
  async sendMessageNotification(receiverId, senderData, messageData) {
    const notificationData = {
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
        actionUrl: `/chat?conversation=${messageData.conversationId}`,
      },
    };

    return this.sendNotification(receiverId, notificationData);
  }

  /**
   * Send comment notification
   */
  async sendCommentNotification(postOwnerId, commenterData, postData) {
    const notificationData = {
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
        actionUrl: `/posts/${postData.postId}`,
      },
    };

    return this.sendNotification(postOwnerId, notificationData);
  }

  /**
   * Send like notification
   */
  async sendLikeNotification(postOwnerId, likerData, postData) {
    const notificationData = {
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
        actionUrl: `/posts/${postData.postId}`,
      },
    };

    return this.sendNotification(postOwnerId, notificationData);
  }

  /**
   * Send notification count update
   */
  async sendUnreadCountUpdate(userId) {
    try {
      const unreadCount = await NotificationService.getUnreadCount(userId);
      this.io.to(`user_${userId}`).emit('unread_count_update', {
        count: unreadCount,
      });
      console.log(
        `📊 Unread count update sent to user ${userId}: ${unreadCount}`
      );
    } catch (error) {
      console.error('❌ Error sending unread count update:', error);
    }
  }

  /**
   * Broadcast notification to multiple users
   */
  async broadcastNotification(userIds, notificationData) {
    try {
      const promises = userIds.map((userId) =>
        this.sendNotification(userId, { ...notificationData, userId })
      );
      await Promise.all(promises);
      console.log(`📡 Broadcast notification sent to ${userIds.length} users`);
    } catch (error) {
      console.error('❌ Error broadcasting notification:', error);
      throw error;
    }
  }
}

module.exports = SocketNotificationService;
