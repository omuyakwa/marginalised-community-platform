const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/commentsController');
const authMiddleware = require('../middleware/auth');

// --- Routes nested under /api/content/:contentId/comments ---
// This requires a bit of clever routing in the main app.js

// --- Routes for direct comment interaction ---

// React to a comment
router.post('/:commentId/react', authMiddleware, commentsController.reactToComment);

// Flag a comment
router.post('/:commentId/flag', authMiddleware, commentsController.flagComment);

module.exports = router;
