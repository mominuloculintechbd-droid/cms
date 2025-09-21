const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Only Super Admin, Admin, or Manager can register new users
exports.register = async (req, res) => {
  const { fullName, email, password, phoneNumber, role, designation, division, status } = req.body;

  // Basic validation
  if (!fullName || !email || !password || !role) {
    return res.status(400).json({ message: 'Please provide all required fields: fullName, email, password, and role.' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'User with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      designation,
      division,
      status: status || 'Active'
    });

    // Don't send password back
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;

    // Emit a notification to all connected clients
    req.io.emit('notification', {
      title: 'New User Registered',
      message: `A new user, ${user.fullName}, has been registered with the role ${user.role}.`,
      user: userResponse
    });

    res.status(201).json({ message: 'User registered successfully', user: userResponse });

  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide both email and password.' });
  }

  try {
    const user = await User.findOne({ where: { email: email.trim() } });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ message: 'Your account is inactive. Please contact an administrator.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET || 'your_default_secret', { expiresIn: '24h' });

    const userResponse = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      designation: user.designation,
      division: user.division,
      profilePicture: user.profilePicture,
      status: user.status,
    };

    res.status(200).json({
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'An error occurred during the login process.' });
  }
};