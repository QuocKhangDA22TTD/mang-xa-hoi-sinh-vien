const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const chatController = require('../controllers/chat.controller');
const verifyToken = require('../middleware/verifyToken');

// Configure multer for chat file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Chỉ cho phép upload ảnh và file văn bản!'));
    }
  },
});

router.post('/conversations', verifyToken, chatController.createConversation);
router.get('/conversations/me', verifyToken, chatController.getMyConversations);
// Text messages (no file upload)
router.post('/messages', verifyToken, chatController.sendMessage);

// File messages (with file upload)
router.post(
  '/messages/file',
  verifyToken,
  upload.single('file'),
  chatController.sendMessage
);
router.get(
  '/messages/:conversationId',
  verifyToken,
  chatController.getMessages
);
router.get('/unread-counts', verifyToken, chatController.getUnreadCounts);
router.post('/mark-read', verifyToken, chatController.markMessagesAsRead);

module.exports = router;
