'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');
const dailyBillingReportController = require('../controllers/dailyBillingReportController');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), dailyBillingReportController.uploadBillingReport);
router.get('/', dailyBillingReportController.getBillingReport);

module.exports = router;
