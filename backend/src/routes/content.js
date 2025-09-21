const express = require('express');
const router = express.Router();
const {
  getAllContent,
  createContent,
  getContentById,
  updateContent,
  deleteContent,
} = require('../controllers/contentController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// All content routes are protected
router.use(protect);

router.route('/')
    .get(getAllContent)
    .post(hasRole('Super Admin', 'Admin', 'Manager'), createContent);

router.route('/:id')
    .get(getContentById)
    .put(hasRole('Super Admin', 'Admin', 'Manager'), updateContent)
    .delete(hasRole('Super Admin', 'Admin'), deleteContent);

module.exports = router;
