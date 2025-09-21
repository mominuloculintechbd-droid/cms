const express = require('express');
const router = express.Router();
const authRoutes = require('./auth');
const ticketRoutes = require('./tickets');
const contentRoutes = require('./content');
const meterReadingRoutes = require('./meterReadings');
const customerRoutes = require('./customers');
const lastBillDateRoutes = require('./lastBillDate');
const meterReplacementRoutes = require('./meterReplacement');
const mdmReadsRoutes = require('./mdmReads');
const userRoutes = require('./users'); // Added user routes
const reportRoutes = require('./reports');
const notificationRoutes = require('./notifications');
const teamRoutes = require('./teams');
const batchOperationalReportRoutes = require('./batchOperationalReport');
const billStopAnalysisRoutes = require('./billStopAnalysis');
const dailyBillingReportRoutes = require('./dailyBillingReport');

router.use('/auth', authRoutes);
router.use('/users', userRoutes); // Added user routes
router.use('/tickets', ticketRoutes);
router.use('/content', contentRoutes);
router.use('/meter-readings', meterReadingRoutes);
router.use('/bill-stop', require('./billStop'));
router.use('/customers', customerRoutes);
router.use('/last-bill-date', lastBillDateRoutes);
router.use('/meter-replacement', meterReplacementRoutes);
router.use('/mdm-reads', mdmReadsRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);
router.use('/teams', teamRoutes);
router.use('/batch-operational-report', batchOperationalReportRoutes);
router.use('/bill-stop-analysis', billStopAnalysisRoutes);
router.use('/daily-billing-report', dailyBillingReportRoutes);

module.exports = router;
