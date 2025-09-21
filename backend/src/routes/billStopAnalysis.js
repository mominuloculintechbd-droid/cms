'use strict';

const express = require('express');
const router = express.Router();
const billStopAnalysisController = require('../controllers/billStopAnalysisController');

router.post('/analyze/:customerId', billStopAnalysisController.analyzeBillStopIssue);

module.exports = router;
