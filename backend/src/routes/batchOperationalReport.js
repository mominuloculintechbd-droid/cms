'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const batchOperationalReportController = require('../controllers/batchOperationalReportController');

// Configure multer for in-memory file storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), batchOperationalReportController.uploadBatchReport);
router.get('/', batchOperationalReportController.getBatchReport);
router.delete('/', batchOperationalReportController.deleteBatchReport);
router.get('/monthly-performance', batchOperationalReportController.getMonthlyBatchPerformance);

module.exports = router;
