/**
 * API Key Authentication Middleware
 * Validates API key from request headers
 */

const apiKeyAuth = (req, res, next) => {
  // Get API key from header
  const apiKey = req.headers['x-api-key'];

  // Get the expected API key from environment
  const expectedApiKey = process.env.API_SECRET_KEY;

  // If no expected key is configured, skip validation (for backward compatibility)
  if (!expectedApiKey) {
    console.warn('⚠️  API_SECRET_KEY not configured. API key authentication is disabled.');
    return next();
  }

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key is required',
    });
  }

  // Validate API key
  if (apiKey !== expectedApiKey) {
    return res.status(403).json({
      success: false,
      message: 'Invalid API key',
    });
  }

  // API key is valid, proceed to next middleware
  next();
};

module.exports = apiKeyAuth;
