const express = require('express');
const router = express.Router();
const multer = require('multer');
const mdmReadController = require('../controllers/mdmReadController');
const { protect } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('file'), mdmReadController.uploadMdmReads);
router.get('/', protect, mdmReadController.getMdmReads);
router.delete('/', protect, mdmReadController.deleteMdmReads);
router.get('/download', protect, mdmReadController.downloadMdmReads);

module.exports = router;
