// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authenticateUser = require('../middleware/authenticateMiddleware');

// Define routes for User functionalities
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/verify-email', userController.verifyEmail);

// want to extract the below implementation into a function in userCOntroller.js
router.get('/verification-success', userController.verificationSuccess);

router.get('/profile',authenticateUser, userController.getProfile);
router.put('/profile',authenticateUser, userController.updateProfile);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);

router.post('/logout', userController.logoutUser);

// TODO implement password reset flow.

module.exports = router;
