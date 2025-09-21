const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadReadings,
  getReadingsByMeterNo,
  getReadingsInBulk,
  downloadReadingsAnalysis,
  deleteAllReadings,
} = require('../controllers/meterReadingController');
const { protect, hasRole } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, upload.array('files'), uploadReadings);
router.get('/:meterNo', protect, getReadingsByMeterNo);
router.post('/bulk', protect, getReadingsInBulk);
router.post('/download-analysis', protect, downloadReadingsAnalysis);
router.delete('/all', protect, hasRole('Super Admin', 'Admin'), deleteAllReadings);

module.exports = router;
