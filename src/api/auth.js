const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login user and send 2FA magic link
// @access  Public
router.post('/login', authController.login);

// @route   GET /api/auth/verify-2fa
// @desc    Verify 2FA magic link token
// @access  Public
router.get('/verify-2fa', authController.verify2FA);


module.exports = router;
