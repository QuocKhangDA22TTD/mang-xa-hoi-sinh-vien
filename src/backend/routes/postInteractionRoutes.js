const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const postInteractionController = require('../controllers/postInteractionController');

// Get post interactions (likes and comments)
router.get('/:postId/interactions', postInteractionController.getPostInteractions);

// Like/Unlike routes
router.post('/:postId/like', verifyToken, postInteractionController.likePost);
router.delete('/:postId/like', verifyToken, postInteractionController.unlikePost);
router.post('/:postId/toggle-like', verifyToken, postInteractionController.toggleLike);

// Comment routes
router.post('/:postId/comments', verifyToken, postInteractionController.addComment);
router.delete('/comments/:commentId', verifyToken, postInteractionController.deleteComment);

module.exports = router;
