const telegramService = require('../services/telegramService');
const pdfParserService = require('../services/pdfParserService');
const readingProcessorService = require('../services/readingProcessorService');

/**
 * Handle incoming Telegram webhook updates
 */
const handleWebhook = async (req, res) => {
    try {
        const update = req.body;

        // Log the update for debugging
        console.log('Telegram webhook received:', JSON.stringify(update, null, 2));

        // Check if this is a document upload
        if (update.message && update.message.document) {
            await handleDocumentUpload(update.message);
        }

        // Always respond with 200 OK to acknowledge receipt
        res.status(200).send('OK');
    } catch (error) {
        console.error('Error handling Telegram webhook:', error);
        res.status(200).send('OK'); // Still send OK to avoid Telegram retrying
    }
};

/**
 * Handle document upload from Telegram
 */
const handleDocumentUpload = async (message) => {
    const document = message.document;
    const fileName = document.file_name;

    try {
        // Check if it's a PDF file
        if (!fileName || !fileName.toLowerCase().endsWith('.pdf')) {
            await telegramService.sendMessage(
                '⚠️ Please upload only PDF files for billing profile processing.'
            );
            return;
        }

        // Send processing started message
        await telegramService.sendMessage(
            `⏳ Processing billing profile: <b>${fileName}</b>\n\nPlease wait...`
        );

        // Download the PDF file
        console.log('Downloading PDF from Telegram:', document.file_id);
        const pdfBuffer = await telegramService.downloadFile(document.file_id);

        // Parse the PDF
        console.log('Parsing PDF...');
        const parsedData = await pdfParserService.parseBillingProfile(pdfBuffer);
        console.log('PDF parsed successfully:', parsedData.meterNo, 'readings:', parsedData.totalReadings);

        // Process and save readings
        console.log('Processing and saving readings...');
        const processResult = await readingProcessorService.processAndSaveReadings(
            parsedData.meterNo,
            parsedData.readings
        );
        console.log('Readings processed:', processResult);

        // Send confirmation message
        await telegramService.sendBillingProfileUploadConfirmation(processResult);

    } catch (error) {
        console.error('Error processing PDF:', error);
        await telegramService.sendPDFProcessingError(error.message, fileName);
    }
};

/**
 * Set webhook URL for Telegram bot
 */
const setWebhook = async (req, res) => {
    try {
        const webhookUrl = req.body.webhookUrl;

        if (!webhookUrl) {
            return res.status(400).json({ error: 'Webhook URL is required' });
        }

        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        if (!TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({ error: 'Telegram bot token not configured' });
        }

        const axios = require('axios');
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`,
            {
                url: webhookUrl,
                allowed_updates: ['message']
            }
        );

        res.status(200).json({
            success: true,
            message: 'Webhook set successfully',
            data: response.data
        });

    } catch (error) {
        console.error('Error setting webhook:', error);
        res.status(500).json({ error: 'Failed to set webhook', details: error.message });
    }
};

/**
 * Get webhook info
 */
const getWebhookInfo = async (req, res) => {
    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        if (!TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({ error: 'Telegram bot token not configured' });
        }

        const axios = require('axios');
        const response = await axios.get(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`
        );

        res.status(200).json(response.data);

    } catch (error) {
        console.error('Error getting webhook info:', error);
        res.status(500).json({ error: 'Failed to get webhook info', details: error.message });
    }
};

/**
 * Delete webhook (switch back to polling mode)
 */
const deleteWebhook = async (req, res) => {
    try {
        const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

        if (!TELEGRAM_BOT_TOKEN) {
            return res.status(500).json({ error: 'Telegram bot token not configured' });
        }

        const axios = require('axios');
        const response = await axios.post(
            `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`
        );

        res.status(200).json({
            success: true,
            message: 'Webhook deleted successfully',
            data: response.data
        });

    } catch (error) {
        console.error('Error deleting webhook:', error);
        res.status(500).json({ error: 'Failed to delete webhook', details: error.message });
    }
};

module.exports = {
    handleWebhook,
    setWebhook,
    getWebhookInfo,
    deleteWebhook
};
