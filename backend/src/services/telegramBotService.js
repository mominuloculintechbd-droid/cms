const TelegramBot = require('node-telegram-bot-api');
const pdfParserService = require('./pdfParserService');
const csvParserService = require('./csvParserService');
const readingProcessorService = require('./readingProcessorService');
const telegramService = require('./telegramService');

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

class TelegramBotService {
    constructor() {
        this.bot = null;
        this.isRunning = false;
    }

    /**
     * Start the Telegram bot (supports both polling and webhook modes)
     */
    async start() {
        if (!TELEGRAM_BOT_TOKEN) {
            console.log('⚠️  Telegram bot token not configured. Bot will not start.');
            return;
        }

        if (this.isRunning) {
            console.log('Telegram bot is already running.');
            return;
        }

        const mode = process.env.TELEGRAM_MODE || 'polling';

        try {
            if (mode === 'webhook') {
                // Webhook mode - no polling, just create bot instance
                this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
                console.log('✅ Telegram bot initialized successfully (Webhook mode)');
                console.log('📄 Webhook should be configured at your server endpoint');
            } else {
                // Polling mode - delete webhook first to prevent conflicts
                const tempBot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });

                try {
                    await tempBot.deleteWebHook();
                    console.log('🧹 Cleared any existing webhook');
                } catch (error) {
                    console.log('ℹ️  No webhook to clear or error clearing webhook:', error.message);
                }

                // Create bot instance with polling
                this.bot = new TelegramBot(TELEGRAM_BOT_TOKEN, {
                    polling: {
                        interval: 1000,
                        autoStart: true,
                        params: {
                            timeout: 10
                        }
                    }
                });

                console.log('✅ Telegram bot started successfully (Polling mode)');
                console.log('📄 Ready to receive PDF files...');
            }

            this.isRunning = true;

            // Handle document uploads
            this.bot.on('document', async (msg) => {
                await this.handleDocument(msg);
            });

            // Handle text messages (customer queries and commands)
            this.bot.on('message', async (msg) => {
                // Only respond to non-document messages
                if (!msg.document && msg.text) {
                    if (msg.text === '/start') {
                        await this.bot.sendMessage(
                            msg.chat.id,
                            '👋 Hello! I can help you with:\n\n' +
                            '📄 <b>File Processing:</b>\n' +
                            '   • PDF - Billing Profile PDFs\n' +
                            '   • CSV/TXT - Meter reading data\n\n' +
                            '🔍 <b>Customer Information:</b>\n' +
                            '   • Send a customer number or meter number\n' +
                            '   • Example: 10891641\n\n' +
                            'Try uploading a file or sending a customer number!',
                            { parse_mode: 'HTML' }
                        );
                    } else if (msg.text.match(/^\d+$/)) {
                        // Handle customer number query (numeric only)
                        await this.handleCustomerQuery(msg);
                    }
                }
            });

            // Handle errors (only for polling mode)
            if (mode === 'polling') {
                this.bot.on('polling_error', (error) => {
                    console.error('Telegram polling error:', error.message);

                    // If conflict detected, try to recover by clearing webhook
                    if (error.message.includes('409') || error.message.includes('Conflict')) {
                        console.error('⚠️  Detected polling conflict (409). Possible causes:');
                        console.error('    1. Another server instance is running');
                        console.error('    2. A webhook is still active');
                        console.error('    3. Multiple Telegram bot clients connected');
                        console.error('');
                        console.error('💡 Solutions:');
                        console.error('    • Stop all other server instances');
                        console.error('    • Wait 60 seconds for polling to timeout');
                        console.error('    • Or switch to webhook mode (set TELEGRAM_MODE=webhook in .env)');
                        console.error('');
                        console.error('⚠️  Bot will stop to prevent conflicts.');

                        this.stop();

                        // Don't exit the entire server - just stop the bot
                        // This allows the server to continue running
                    } else {
                        // Log other polling errors but don't stop
                        console.error('Polling error (non-conflict):', error.message);
                    }
                });
            }

        } catch (error) {
            console.error('Error starting Telegram bot:', error);
            this.isRunning = false;
        }
    }

    /**
     * Stop the bot
     */
    async stop() {
        if (this.bot && this.isRunning) {
            try {
                const mode = process.env.TELEGRAM_MODE || 'polling';

                if (mode === 'polling') {
                    await this.bot.stopPolling();
                }

                this.isRunning = false;
                console.log('Telegram bot stopped.');
            } catch (error) {
                console.error('Error stopping Telegram bot:', error.message);
                this.isRunning = false;
            }
        }
    }

    /**
     * Handle document upload
     */
    async handleDocument(msg) {
        const chatId = msg.chat.id;
        const document = msg.document;
        const fileName = document.file_name;

        console.log(`📄 Document received: ${fileName} from chat ${chatId}`);

        try {
            // Determine file type
            const fileExt = fileName.toLowerCase().split('.').pop();
            const isPDF = fileExt === 'pdf';
            const isCSV = ['csv', 'txt'].includes(fileExt);

            if (!isPDF && !isCSV) {
                await this.bot.sendMessage(
                    chatId,
                    '⚠️ Unsupported file format.\n\n' +
                    '📄 Supported formats:\n' +
                    '   • PDF (.pdf)\n' +
                    '   • CSV (.csv, .txt)'
                );
                return;
            }

            // Send processing message
            await this.bot.sendMessage(
                chatId,
                `⏳ Processing ${isPDF ? 'PDF' : 'CSV'} file: <b>${fileName}</b>\n\nPlease wait...`,
                { parse_mode: 'HTML' }
            );

            // Download the file
            console.log(`⬇️  Downloading ${fileExt.toUpperCase()}...`);
            const axios = require('axios');

            const fileInfo = await this.bot.getFile(document.file_id);
            const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileInfo.file_path}`;

            const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
            const fileBuffer = Buffer.from(response.data);

            // Parse the file based on type
            console.log(`📊 Parsing ${fileExt.toUpperCase()}...`);
            let parsedData;

            if (isPDF) {
                parsedData = await pdfParserService.parseBillingProfile(fileBuffer);
            } else {
                parsedData = await csvParserService.parseMeterReadings(fileBuffer);
            }

            console.log(`✅ Parsed: Meter ${parsedData.meterNo}, ${parsedData.totalReadings} valid readings`);

            // Process and save readings
            console.log('💾 Processing and saving readings...');
            const processResult = await readingProcessorService.processAndSaveReadings(
                parsedData.meterNo,
                parsedData.readings
            );
            console.log(`✅ Saved ${processResult.newSaved} new readings`);

            // Add skipped null readings info to result if available
            if (parsedData.skippedNullReadings) {
                processResult.skippedNullReadings = parsedData.skippedNullReadings;
            }

            // Send confirmation message
            await this.sendConfirmationMessage(chatId, processResult);

        } catch (error) {
            console.error('❌ Error processing file:', error);
            await this.sendErrorMessage(chatId, error.message, fileName);
        }
    }

    /**
     * Handle customer number query
     */
    async handleCustomerQuery(msg) {
        const chatId = msg.chat.id;
        const searchValue = msg.text.trim();

        console.log(`🔍 Customer query received: ${searchValue} from chat ${chatId}`);

        try {
            // Send searching message
            await this.bot.sendMessage(
                chatId,
                `🔍 Searching for customer: <b>${searchValue}</b>\n\nPlease wait...`,
                { parse_mode: 'HTML' }
            );

            // Import required models
            const { Customer, LastBillDate, MeterReading, MeterReplacement } = require('../models');
            const { Op } = require('sequelize');

            // Find customer by Customer ID or Meter Number
            const customer = await Customer.findOne({
                where: {
                    [Op.or]: [
                        { CUSTOMER_NUM: searchValue },
                        { METER_NO: searchValue }
                    ]
                }
            });

            if (!customer) {
                await this.bot.sendMessage(
                    chatId,
                    `❌ <b>Customer Not Found</b>\n\n` +
                    `🔍 Search Value: ${searchValue}\n\n` +
                    `💡 Please check:\n` +
                    `   • Customer number is correct\n` +
                    `   • Meter number is correct\n` +
                    `   • Customer exists in database`,
                    { parse_mode: 'HTML' }
                );
                return;
            }

            // Get last bill date
            const lastBillRecord = await LastBillDate.findOne({
                where: { CUSTOMER_NUM: customer.CUSTOMER_NUM }
            });

            const lastBillDate = lastBillRecord ? lastBillRecord.LAST_BILL_DATE : null;
            const now = new Date();
            let billStatus = 'Unknown';
            let monthsSinceBill = 0;

            // Determine bill status
            if (lastBillDate) {
                const lastBill = new Date(lastBillDate);
                const diffTime = Math.abs(now - lastBill);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                monthsSinceBill = Math.floor(diffDays / 30);

                if (monthsSinceBill === 0) {
                    billStatus = '✅ Bill Generated This Month';
                } else if (monthsSinceBill === 1) {
                    billStatus = '⚠️ Bill Generated Last Month';
                } else if (monthsSinceBill > 1) {
                    billStatus = `🚫 Bill Stop (${monthsSinceBill} months)`;
                }
            } else {
                billStatus = '❓ No Bill Record Found';
            }

            // Get meter readings count
            const readingsCount = await MeterReading.count({
                where: { meter_no: customer.METER_NO }
            });

            // Get latest meter reading
            const latestReading = await MeterReading.findOne({
                where: { meter_no: customer.METER_NO },
                order: [['reading_date', 'DESC']]
            });

            // Get meter replacement info
            const meterReplacement = await MeterReplacement.findOne({
                where: {
                    [Op.or]: [
                        { oldMeterNumber: customer.METER_NO },
                        { replaceMeterNumber: customer.METER_NO }
                    ]
                },
                order: [['createdAt', 'DESC']]
            });

            // Format and send customer information
            let message = `📋 <b>CUSTOMER INFORMATION</b>\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

            message += `👤 <b>Customer Details:</b>\n`;
            message += `   • Name: ${customer.CUSTOMER_NAME || 'N/A'}\n`;
            message += `   • Customer ID: ${customer.CUSTOMER_NUM}\n`;
            message += `   • Meter Number: ${customer.METER_NO}\n`;
            message += `   • Mobile: ${customer.MOBILE_NO || 'N/A'}\n`;
            message += `   • Address: ${customer.ADDRESS || 'N/A'}\n\n`;

            message += `⚡ <b>Connection Details:</b>\n`;
            message += `   • Tariff: ${customer.TARIFF || 'N/A'}\n`;
            message += `   • Phase: ${customer.PHASE || 'N/A'}\n`;
            message += `   • Sanction Load: ${customer.SANCTION_LOAD || 'N/A'}\n`;
            message += `   • Connection Date: ${customer.CONN_DATE ? new Date(customer.CONN_DATE).toLocaleDateString() : 'N/A'}\n\n`;

            message += `📍 <b>Location:</b>\n`;
            message += `   • NOCS: ${customer.NOCS_NAME || 'N/A'}\n`;
            message += `   • Feeder: ${customer.FEEDER_NAME || customer.FEEDER_NO || 'N/A'}\n\n`;

            message += `💰 <b>Billing Status:</b>\n`;
            message += `   • Status: ${billStatus}\n`;
            message += `   • Last Bill Date: ${lastBillDate ? new Date(lastBillDate).toLocaleDateString() : 'No record'}\n`;
            if (monthsSinceBill > 0) {
                message += `   • Months Since Bill: ${monthsSinceBill}\n`;
            }
            message += `\n`;

            message += `📊 <b>Meter Readings:</b>\n`;
            message += `   • Total Readings: ${readingsCount}\n`;
            if (latestReading) {
                message += `   • Latest Reading Date: ${new Date(latestReading.reading_date).toLocaleDateString()}\n`;

                // Use value_kwh as primary, fall back to TOTAL_ENERGY
                const energyValue = latestReading.value_kwh || latestReading.TOTAL_ENERGY || 0;
                message += `   • Reading Value: ${energyValue.toFixed(2)} kWh\n`;

                // Show TOD breakdown if available
                if (latestReading.TOD1_ENERGY !== null && latestReading.TOD2_ENERGY !== null) {
                    message += `   • TOD1 Energy: ${latestReading.TOD1_ENERGY.toFixed(2)} kWh\n`;
                    message += `   • TOD2 Energy: ${latestReading.TOD2_ENERGY.toFixed(2)} kWh\n`;
                }

                // Show if estimated
                if (latestReading.is_estimated) {
                    message += `   • ⚠️ Estimated Reading (${latestReading.estimation_method || 'Unknown method'})\n`;
                }
            } else {
                message += `   • Latest Reading: No readings found\n`;
            }

            if (meterReplacement) {
                message += `\n⚙️ <b>Meter Replacement:</b>\n`;
                message += `   • Old Meter: ${meterReplacement.oldMeterNumber || 'N/A'}\n`;
                message += `   • New Meter: ${meterReplacement.replaceMeterNumber || 'N/A'}\n`;
                message += `   • Replace Date: ${new Date(meterReplacement.replaceDate).toLocaleDateString()}\n`;
                message += `   • Install Date: ${new Date(meterReplacement.installDate).toLocaleDateString()}\n`;
                message += `   • Old Meter Last Reading: ${meterReplacement.oldMeterLastReads.toFixed(2)} kWh\n`;
            }

            await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });

            console.log(`✅ Customer info sent for: ${customer.CUSTOMER_NUM}`);

        } catch (error) {
            console.error('❌ Error fetching customer info:', error);
            await this.bot.sendMessage(
                chatId,
                `❌ <b>ERROR</b>\n\n` +
                `Failed to fetch customer information.\n\n` +
                `Error: ${error.message}`,
                { parse_mode: 'HTML' }
            );
        }
    }

    /**
     * Send confirmation message
     */
    async sendConfirmationMessage(chatId, processResult) {
        const { meterNo, totalExtracted, newSaved, duplicatesSkipped, savedReadings, skippedNullReadings } = processResult;

        let message = `📄 <b>FILE PROCESSED SUCCESSFULLY</b>\n\n`;
        message += `⚡ <b>Meter Number:</b> ${meterNo}\n\n`;

        message += `📊 <b>PROCESSING SUMMARY</b>\n`;
        message += `━━━━━━━━━━━━━━━━━━━━\n`;
        message += `📈 <b>Total Valid Readings:</b> ${totalExtracted}\n`;
        message += `✅ <b>New Readings Saved:</b> ${newSaved}\n`;
        message += `⏭️ <b>Duplicates Skipped:</b> ${duplicatesSkipped}\n`;
        if (skippedNullReadings > 0) {
            message += `⚠️ <b>Null Values Skipped:</b> ${skippedNullReadings}\n`;
        }
        message += `\n`;

        if (newSaved > 0) {
            message += `💾 <b>SAVED READINGS (${newSaved})</b>\n`;
            message += `━━━━━━━━━━━━━━━━━━━━\n`;

            // Show first 5 saved readings
            const readingsToShow = savedReadings.slice(0, 5);
            readingsToShow.forEach((reading, index) => {
                const date = new Date(reading.date);
                message += `${index + 1}. <b>${date.toLocaleDateString()}</b>\n`;
                message += `   📊 Total: ${reading.total_energy.toFixed(2)} kWh\n`;
                message += `   🔹 TOD1: ${reading.tod1_energy.toFixed(2)} kWh\n`;
                message += `   🔸 TOD2: ${reading.tod2_energy.toFixed(2)} kWh\n\n`;
            });

            if (savedReadings.length > 5) {
                message += `   ... and ${savedReadings.length - 5} more readings\n\n`;
            }

            // Add date range
            const dates = savedReadings.map(r => new Date(r.date));
            const minDate = new Date(Math.min(...dates));
            const maxDate = new Date(Math.max(...dates));
            message += `📅 <b>Date Range:</b> ${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}\n\n`;
        }

        if (duplicatesSkipped > 0) {
            message += `ℹ️ <i>${duplicatesSkipped} reading(s) already existed in database and were skipped</i>\n\n`;
        }

        if (newSaved > 0) {
            message += `✅ <b>Database updated successfully!</b>`;
        } else {
            message += `⚠️ <b>No new readings to save. All readings already exist in database.</b>`;
        }

        await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }

    /**
     * Send error message
     */
    async sendErrorMessage(chatId, error, fileName = '') {
        let message = `❌ <b>FILE PROCESSING FAILED</b>\n\n`;

        if (fileName) {
            message += `📄 <b>File:</b> ${fileName}\n\n`;
        }

        message += `🚫 <b>Error:</b> ${error}\n\n`;
        message += `💡 <b>Please check:</b>\n`;
        message += `   • File format is supported (PDF, CSV, TXT)\n`;
        message += `   • File contains meter number (METERNO)\n`;
        message += `   • File contains valid readings with dates\n`;
        message += `   • File is not corrupted or password protected\n`;
        message += `   • CSV files have proper headers (METERNO, readdttm, read)\n`;

        await this.bot.sendMessage(chatId, message, { parse_mode: 'HTML' });
    }

    /**
     * Get bot status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            hasToken: !!TELEGRAM_BOT_TOKEN
        };
    }
}

module.exports = new TelegramBotService();
