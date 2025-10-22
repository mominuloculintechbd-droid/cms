
const express = require('express');
const router = express.Router();
const complaintCategoryController = require('../controllers/complaintCategoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', complaintCategoryController.getAllCategories);
router.post('/', protect, complaintCategoryController.createCategory);
router.put('/:id', protect, complaintCategoryController.updateCategory);
router.delete('/:id', protect, complaintCategoryController.deleteCategory);

module.exports = router;
