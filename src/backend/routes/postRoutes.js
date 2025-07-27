const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const verifyToken = require('../middleware/verifyToken');

// 🔒 Chỉ người dùng đã đăng nhập mới được tạo bài viết
router.post('/', verifyToken, postController.createPost);

// 👁️ Công khai: ai cũng xem được danh sách và chi tiết bài viết
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostsByUserId);

module.exports = router;
