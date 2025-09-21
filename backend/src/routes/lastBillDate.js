const express = require('express');
const router = express.Router();
const multer = require('multer');
const lastBillDateController = require('../controllers/lastBillDateController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('file'), lastBillDateController.uploadLastBillDate);
router.get('/search', protect, lastBillDateController.searchLastBillDate);
router.delete('/delete-all', protect, lastBillDateController.deleteAllLastBillDate);

module.exports = router;