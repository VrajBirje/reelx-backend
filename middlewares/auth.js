const { requireAuth } = require('@clerk/clerk-sdk-node');

// Middleware for authentication
const authenticate = (req, res, next) => {
  try {
    // Validate authentication
    requireAuth()(req, res, () => {
      next(); // Proceed to the next middleware/controller
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Unauthorized access. Please log in.',
    });
  }
};

module.exports = { authenticate };
