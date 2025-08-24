const express = require('express');
const router = express.Router();
const summariesController = require('../controllers/summariesController');

// @route   GET /api/summaries
// @desc    Get the latest daily summary
// @access  Public
router.get('/', summariesController.getLatestSummary);

module.exports = router;
