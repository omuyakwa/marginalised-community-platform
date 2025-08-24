const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const commentsController = require('../controllers/commentsController');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/content
// @desc    Get all public content
// @access  Public
router.get('/', contentController.getPublicContent);

// @route   POST /api/content
// @desc    Create a new piece of content
// @access  Private
router.post('/', authMiddleware, contentController.createContent);

// @route   GET /api/content/my-content
// @desc    Get all content for the logged-in user
// @access  Private
router.get('/my-content', authMiddleware, contentController.getMyContent);

// @route   GET /api/content/:id
// @desc    Get a single content item
// @access  Public
router.get('/:id', contentController.getContentById);


// --- Comment Routes Nested Under Content ---

// @route   GET /api/content/:contentId/comments
// @desc    Get all comments for a piece of content
// @access  Public
router.get('/:contentId/comments', commentsController.getCommentsByContentId);

// @route   POST /api/content/:contentId/comments
// @desc    Create a new comment on a piece of content
// @access  Private
router.post('/:contentId/comments', authMiddleware, commentsController.createComment);


module.exports = router;
