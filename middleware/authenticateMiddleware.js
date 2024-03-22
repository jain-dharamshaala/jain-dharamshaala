// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// const authenticateUser = (req, res, next) => {
//   // Get the token from the request header
//   const authHeader = req.header('Authorization');
//   if (!authHeader) {
//     return res.status(401).json({ message: 'Authorization header is missing' });
//   }

//   const [bearer, token] = authHeader.split(' ');
//   if (!token || bearer !== 'Bearer') {
//     return res.status(401).json({ message: 'Invalid Authorization header format' });
//   }

//   try {
//     // Verify the token
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(401).json({ message: 'Unauthorized - Invalid token' });
//   }
// };
const authenticateUser = (req, res, next) => {
  // Get the token from the request header
  if (req.session.userId) {
    // The user is logged in. Allow the request to proceed.
    next();
  } else {
    // The user is not logged in. Reject the request.
    res.status(401).send('You must be logged in to access this route');
  }
};


module.exports = authenticateUser;
