// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define routes for User functionalities
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/verify-email', userController.verifyEmail);
router.get('/verification-success', (req, res) => {
    res.send('<h2>Email Verification Successful</h2><p>Your email address has been successfully verified.</p>');
});

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

// TODO use session based authentication 
// router.post('/logout', (req, res) => {
//     // Destroy session on logout
//     req.session.destroy((err) => {
//       if (err) {
//         console.error('Error logging out:', err);
//         res.status(500).json({ message: 'Internal server error' });
//       } else {
//         res.json({ message: 'Logout successful' });
//       }
//     });
//   });

// TODO implement password reset flow.

module.exports = router;
