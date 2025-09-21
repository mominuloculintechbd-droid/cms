const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
      
      // Attach user to the request, excluding the password
      req.user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!req.user) {
        return res.status(401).send('Not authorized, user not found');
      }

      next();
    } catch (error) {
      return res.status(401).send('Not authorized, token failed');
    }
  } else {
    res.status(401).send('Not authorized, no token');
  }
};

const hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden. Requires one of these roles: ${roles.join(', ')}` });
    }
    next();
  };
};

module.exports = { protect, hasRole };