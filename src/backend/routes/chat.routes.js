const express = require("express");
const router = express.Router();
const chatController = require("../controllers/chat.controller");
const verifyToken = require("../middleware/verifyToken");

router.post("/conversations", verifyToken, chatController.createConversation);
router.get("/conversations/me", verifyToken, chatController.getMyConversations);
router.post("/messages", verifyToken, chatController.sendMessage);
router.get(
  "/messages/:conversationId",
  verifyToken,
  chatController.getMessages
);

module.exports = router;
