const express = require('express');
const router = express.Router();
const friendsController = require('../controllers/friendsController');
const friendRequestsController = require('../controllers/friendRequestsController');
const verifyToken = require('../middleware/verifyToken');

// Tất cả routes đều cần authentication
router.use(verifyToken);

// Lấy danh sách bạn bè
router.get('/friends', friendsController.getFriends);

// Gửi lời mời kết bạn
router.post('/requests', friendRequestsController.sendFriendRequest);

// Lấy danh sách lời mời đã gửi
router.get('/requests/sent', friendRequestsController.getSentRequests);

// Lấy danh sách lời mời đã nhận
router.get('/requests/received', friendRequestsController.getReceivedRequests);

// Chấp nhận lời mời kết bạn
router.put(
  '/requests/:request_id/accept',
  friendRequestsController.acceptFriendRequest
);

// Từ chối lời mời kết bạn
router.put(
  '/requests/:request_id/decline',
  friendRequestsController.declineFriendRequest
);

// Hủy kết bạn
router.delete('/friends/:friend_id', friendsController.unfriend);

// Lấy danh sách tất cả users (để tìm kiếm)
router.get('/users', friendsController.getAllUsers);

module.exports = router;
