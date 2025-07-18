const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

// Đăng ký, đăng nhập, đăng xuất
router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

// Route kiểm tra token hợp lệ và lấy thông tin người dùng
router.get('/me', verifyToken, (req, res) => {
  res.json({
    message: 'You are authenticated',
    user: req.user,
  });
});

module.exports = router;
