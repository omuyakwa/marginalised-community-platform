const express = require('express');
const router = express.Router();
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middleware/auth');

// @route   POST /api/content
// @desc    Create a new piece of content
// @access  Private
router.post('/', authMiddleware, contentController.createContent);

module.exports = router;
