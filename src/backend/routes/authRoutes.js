const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const verifyToken = require('../middleware/verifyToken');

// Đăng ký, đăng nhập, đăng xuất
router.post('/register', authController.register);

router.post('/login', authController.login);

router.post('/logout', authController.logout);

// Set user offline (for page unload events)
router.post('/set-offline', authController.setOffline);

// Heartbeat to keep user online
router.post('/heartbeat', verifyToken, authController.heartbeat);

// Route kiểm tra token hợp lệ và lấy thông tin người dùng
router.get('/me', verifyToken, async (req, res) => {
  try {
    const db = require('../config/db');

    // Get user info with profile data
    const [users] = await db.execute(
      `SELECT u.id, u.email, u.is_online, u.last_active,
              p.full_name, p.nickname, p.avatar_url, p.bio, p.birthday, p.address, p.banner_url
       FROM users u
       LEFT JOIN profile p ON u.id = p.user_id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const user = users[0];
    res.json({
      message: 'You are authenticated',
      user: {
        id: user.id,
        email: user.email,
        is_online: user.is_online,
        last_active: user.last_active,
        full_name: user.full_name,
        nickname: user.nickname,
        avatar_url: user.avatar_url,
        bio: user.bio,
        birthday: user.birthday,
        address: user.address,
        banner_url: user.banner_url,
      },
    });
  } catch (error) {
    console.error('❌ Error getting user info:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
