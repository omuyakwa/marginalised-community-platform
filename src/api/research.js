const express = require('express');
const router = express.Router();
const researchController = require('../controllers/researchController');
const authMiddleware = require('../middleware/auth');

// All routes in this file are protected
router.use(authMiddleware);

// @route   GET /api/research
// @desc    Get all research items for a user
// @access  Private
router.get('/', researchController.getResearchItems);

// @route   POST /api/research
// @desc    Create a new research item
// @access  Private
router.post('/', researchController.createResearchItem);

// @route   DELETE /api/research/:id
// @desc    Delete a research item
// @access  Private
router.delete('/:id', researchController.deleteResearchItem);

module.exports = router;
