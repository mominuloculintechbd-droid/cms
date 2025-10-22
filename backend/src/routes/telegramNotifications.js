const express = require('express');
const router = express.Router();
const telegramNotificationController = require('../controllers/telegramNotificationController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// Get all notification settings (read-only, all authenticated users)
router.get('/', protect, telegramNotificationController.getAllSettings);

// Get setting by category ID (read-only, all authenticated users)
router.get('/:categoryId', protect, telegramNotificationController.getSettingByCategoryId);

// Update/create setting for a category (admin only)
router.put('/:categoryId', protect, hasRole('Super Admin', 'Admin'), telegramNotificationController.updateSetting);

// Bulk update settings (admin only)
router.post('/bulk', protect, hasRole('Super Admin', 'Admin'), telegramNotificationController.bulkUpdateSettings);

// Delete setting (reset to defaults) (admin only)
router.delete('/:categoryId', protect, hasRole('Super Admin', 'Admin'), telegramNotificationController.deleteSetting);

// Initialize default settings (admin only)
router.post('/initialize-defaults', protect, hasRole('Super Admin', 'Admin'), telegramNotificationController.initializeDefaults);

module.exports = router;
