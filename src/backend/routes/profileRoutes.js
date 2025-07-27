// routes/profileRoutes.js
const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const profileController = require('../controllers/profileController');
const {
  uploadAvatar,
  uploadBanner,
  handleUploadError,
} = require('../middleware/upload');

// Debug kiểm tra kiểu của các handler
console.log(
  '[DEBUG] typeof profileController.createProfile:',
  typeof profileController.createProfile
);
console.log(
  '[DEBUG] typeof profileController.getProfile:',
  typeof profileController.getProfile
);
console.log(
  '[DEBUG] typeof profileController.updateProfile:',
  typeof profileController.updateProfile
);
console.log('[DEBUG] typeof verifyToken:', typeof verifyToken);

// Tạo profile mới (người dùng đã đăng nhập)
router.post('/', verifyToken, profileController.createProfile);

// Xem profile theo user_id bất kỳ
router.get('/:userId', verifyToken, profileController.getProfile);

// Cập nhật profile của chính mình
router.put('/', verifyToken, profileController.updateProfile);

// Upload avatar
router.post(
  '/upload/avatar',
  verifyToken,
  uploadAvatar,
  profileController.uploadAvatar
);

// Upload banner
router.post(
  '/upload/banner',
  verifyToken,
  uploadBanner,
  profileController.uploadBanner
);

// Error handler cho upload
router.use(handleUploadError);

module.exports = router;
