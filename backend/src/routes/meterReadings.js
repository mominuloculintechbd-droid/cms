const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  uploadReadings,
  getReadingsByMeterNo,
  getReadingsInBulk,
  downloadReadingsAnalysis,
  deleteAllReadings,
  calculateEstimates,
  saveEstimates,
  getCoveredMonths,
} = require('../controllers/meterReadingController');
const { protect, hasRole } = require('../middleware/authMiddleware');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', protect, hasRole('Super Admin', 'Admin'), upload.array('files'), uploadReadings);
router.get('/:meterNo', protect, getReadingsByMeterNo);
router.post('/bulk', protect, getReadingsInBulk);
router.post('/download-analysis', protect, downloadReadingsAnalysis);
router.delete('/all', protect, hasRole('Super Admin', 'Admin'), deleteAllReadings);

// Estimation routes (Admin and Super Admin only)
router.post('/estimate/:meterNo', protect, hasRole('Super Admin', 'Admin'), calculateEstimates);
router.post('/save-estimates', protect, hasRole('Super Admin', 'Admin'), saveEstimates);
router.get('/covered-months/:meterNo', protect, getCoveredMonths);

module.exports = router;
