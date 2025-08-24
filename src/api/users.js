const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth');

// All routes in this file are protected
router.use(authMiddleware);

// @route   GET /api/users/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', usersController.getUserProfile);

// @route   PUT /api/users/me
// @desc    Update current user's profile
// @access  Private
router.put('/me', usersController.updateUserProfile);

module.exports = router;
