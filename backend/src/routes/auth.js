const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { protect, hasRole } = require('../middleware/authMiddleware');

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Private (Super Admin, Admin, Manager)
router.post('/register', register);

module.exports = router;