// middleware/authMiddleware.js
const authorizeAdmin = (req, res, next) => {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized - Authentication required' });
    }
  
    // Check if user has admin role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden - Admin role required' });
    }
  
    // User is authorized, continue to the next middleware/route handler
    next();
  };
  
  module.exports = authorizeAdmin;
  