// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const profileController = require('../controllers/profileController');

// Tạo profile mới (người dùng đã đăng nhập)
router.post('/', verifyToken, profileController.createProfile);

// Xem profile theo user_id bất kỳ
router.get('/:userId', verifyToken, profileController.getProfile);

// Cập nhật profile của chính mình
router.put('/', verifyToken, profileController.updateProfile);

module.exports = router;
