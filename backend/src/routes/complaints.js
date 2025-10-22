const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// Get all complaints
router.get('/', protect, complaintController.getComplaints);

// Get complaint analytics (must be before /:id route)
router.get('/analytics', protect, complaintController.getComplaintAnalytics);

// Get comprehensive customer billing information (must be before /:id route)
router.get('/billing-info/:searchValue', protect, complaintController.getCustomerBillingInfo);

// Get customer info for a complaint
router.get('/customer/:customerId', protect, complaintController.getCustomerInfo);

// Get a single complaint by ID
router.get('/:id', protect, complaintController.getComplaintById);

// Create a new complaint
router.post('/', protect, complaintController.createComplaint);

// Update a complaint
router.put('/:id', protect, complaintController.updateComplaint);

// Delete a complaint (Admin, Super Admin, Manager only)
router.delete('/:id', protect, hasRole('Admin', 'Super Admin', 'Manager'), complaintController.deleteComplaint);

module.exports = router;