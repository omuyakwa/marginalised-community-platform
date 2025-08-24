const express = require('express');
const router = express.Router();
const metricsController = require('../controllers/metricsController');
const adminAuthMiddleware = require('../middleware/adminAuth');

// @route   GET /api/metrics
// @desc    Get dashboard metrics for admins
// @access  Admin
router.get('/', adminAuthMiddleware, metricsController.getMetrics);

module.exports = router;
