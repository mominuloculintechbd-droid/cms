'use strict';

const express = require('express');
const router = express.Router();
const billStopAnalysisController = require('../controllers/billStopAnalysisController');
const { protect } = require('../middleware/authMiddleware');

// GET route for fetching analysis (used by complaints view)
router.get('/:customerId', protect, billStopAnalysisController.analyzeBillStopIssue);

// POST route for triggering analysis (legacy)
router.post('/analyze/:customerId', protect, billStopAnalysisController.analyzeBillStopIssue);

module.exports = router;
