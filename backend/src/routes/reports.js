const express = require('express');
const router = express.Router();
const { generateBillStopReport } = require('../controllers/reportController');
const { protect, hasRole } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/bill-stop/generate', hasRole('Super Admin', 'Admin'), generateBillStopReport);

module.exports = router;