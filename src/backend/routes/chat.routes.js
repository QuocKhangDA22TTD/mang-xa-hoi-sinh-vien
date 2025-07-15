const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const auth = require('../middleware/auth.middleware');

router.post('/conversations', auth, chatController.createConversation);
router.get('/conversations/me', auth, chatController.getMyConversations);
router.post('/messages', auth, chatController.sendMessage);
router.get('/messages/:conversationId', auth, chatController.getMessages);

module.exports = router;
