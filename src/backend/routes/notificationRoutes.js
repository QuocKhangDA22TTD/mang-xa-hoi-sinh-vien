const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const NotificationService = require('../services/NotificationService');

// Get user notifications
router.get('/', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;

    const notifications = await NotificationService.getUserNotifications(
      userId,
      limit,
      offset
    );

    res.json({
      notifications,
      hasMore: notifications.length === limit,
    });
  } catch (error) {
    console.error('❌ Error getting notifications:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy thông báo' });
  }
});

// Get unread notification count
router.get('/unread-count', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await NotificationService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    console.error('❌ Error getting unread count:', error);
    res
      .status(500)
      .json({ message: 'Lỗi server khi lấy số thông báo chưa đọc' });
  }
});

// Mark notification as read
router.patch('/:id/read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    await NotificationService.markAsRead(notificationId, userId);
    res.json({ message: 'Đã đánh dấu thông báo là đã đọc' });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    res.status(500).json({ message: 'Lỗi server khi đánh dấu thông báo' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await NotificationService.markAllAsRead(userId);
    res.json({ message: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    res
      .status(500)
      .json({ message: 'Lỗi server khi đánh dấu tất cả thông báo' });
  }
});

module.exports = router;
