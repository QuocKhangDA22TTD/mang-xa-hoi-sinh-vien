const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const conversationsController = require('../controllers/conversationsController');
const messagesController = require('../controllers/messagesController');
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

router.post(
  '/conversations',
  verifyToken,
  conversationsController.createConversation
);
router.get(
  '/conversations/me',
  verifyToken,
  conversationsController.getMyConversations
);
// Text messages (no file upload)
router.post('/messages', verifyToken, messagesController.sendMessage);

// File messages (with file upload)
router.post(
  '/messages/file',
  verifyToken,
  upload.single('file'),
  messagesController.sendMessage
);
router.get(
  '/messages/:conversationId',
  verifyToken,
  messagesController.getMessages
);
router.get(
  '/unread-counts',
  verifyToken,
  conversationsController.getUnreadCounts
);
router.post('/mark-read', verifyToken, messagesController.markMessagesAsRead);

// Group management routes
router.post(
  '/conversations/:conversationId/members',
  verifyToken,
  conversationsController.addMemberToGroup
);
router.delete(
  '/conversations/:conversationId/members/:userId',
  verifyToken,
  conversationsController.removeMemberFromGroup
);
router.get(
  '/conversations/:conversationId/members',
  verifyToken,
  conversationsController.getGroupMembers
);
router.put(
  '/conversations/:conversationId',
  verifyToken,
  conversationsController.updateGroupInfo
);

module.exports = router;
