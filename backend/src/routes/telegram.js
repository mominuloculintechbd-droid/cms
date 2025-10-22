const express = require('express');
const router = express.Router();
const telegramWebhookController = require('../controllers/telegramWebhookController');
const { protect } = require('../middleware/authMiddleware');

// Webhook endpoint - No auth required (Telegram will call this)
router.post('/webhook', telegramWebhookController.handleWebhook);

// Management endpoints - Require authentication
router.post('/webhook/set', protect, telegramWebhookController.setWebhook);
router.get('/webhook/info', protect, telegramWebhookController.getWebhookInfo);
router.delete('/webhook', protect, telegramWebhookController.deleteWebhook);

module.exports = router;
