const express = require('express');
const router = express.Router();
const friendController = require('../controllers/friend.controller');
const verifyToken = require('../middleware/verifyToken');

// Tất cả routes đều cần authentication
router.use(verifyToken);

// Lấy danh sách bạn bè
router.get('/friends', friendController.getFriends);

module.exports = router;

// Tất cả routes đều cần authentication
router.use(verifyToken);

// Gửi lời mời kết bạn
router.post('/requests', friendController.sendFriendRequest);

// Lấy danh sách lời mời đã gửi
router.get('/requests/sent', friendController.getSentRequests);

// Lấy danh sách lời mời đã nhận
router.get('/requests/received', friendController.getReceivedRequests);

// Chấp nhận lời mời kết bạn
router.put(
  '/requests/:request_id/accept',
  friendController.acceptFriendRequest
);

// Từ chối lời mời kết bạn
router.put(
  '/requests/:request_id/decline',
  friendController.declineFriendRequest
);

// Lấy danh sách bạn bè
router.get('/friends', friendController.getFriends);

// Hủy kết bạn
router.delete('/friends/:friend_id', friendController.unfriend);

// Lấy danh sách tất cả users (để tìm kiếm)
router.get('/users', friendController.getAllUsers);

module.exports = router;
