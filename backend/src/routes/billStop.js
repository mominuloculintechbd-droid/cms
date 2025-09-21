const express = require('express');
const router = express.Router();
const multer = require('multer');
const billStopController = require('../controllers/billStopController');
const { protect, hasRole } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Upload and analyze CSV file
router.post('/upload-and-analyze', protect, upload.single('file'), billStopController.uploadAndAnalyze);

// Get bill stop analysis for specific customer/meter
router.get('/analyze', protect, billStopController.getBillStopAnalysis);

// Get bill stop report
router.get('/report', protect, billStopController.getBillStopReport);

router.get('/customers', protect, billStopController.getBillStopCustomers);


module.exports = router;
