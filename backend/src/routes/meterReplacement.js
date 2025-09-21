const express = require('express');
const router = express.Router();
const multer = require('multer');
const { processMeterReplacementData, processSingleRow } = require('../controllers/meterReplacementController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), processMeterReplacementData);
router.post('/process-row', processSingleRow);

module.exports = router;
