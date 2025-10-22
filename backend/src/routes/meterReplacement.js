const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processMeterReplacementData, processSingleRow, getMeterReplacementHistory } = require('../controllers/meterReplacementController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), processMeterReplacementData);
router.post('/process-row', processSingleRow);
router.get('/history/:meterNo', getMeterReplacementHistory);

module.exports = router;
