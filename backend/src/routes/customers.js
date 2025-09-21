const express = require('express');
const router = express.Router();
const multer = require('multer');
const customerController = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('file'), customerController.uploadCustomers);
router.get('/search', protect, customerController.searchCustomers);
router.get('/count', protect, customerController.getCustomerCount);
router.get('/installations/monthly', protect, customerController.getMonthlyInstallations);
router.get('/reports/nocs', protect, customerController.getNocsReport);
router.delete('/', protect, customerController.deleteAllCustomers);


module.exports = router;
