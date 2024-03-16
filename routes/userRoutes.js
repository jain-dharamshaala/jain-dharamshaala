// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Define routes for User functionalities
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.get('/', userController.getAllUsers);

module.exports = router;
