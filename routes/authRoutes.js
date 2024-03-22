// routes/authRoutes.js

const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-reset-token', authController.verifyResetToken);

router.get('/login/success', authController.loginSuccess);
router.get('/login/failed', authController.loginFailed);

router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login/failed' }),
  (req, res) => {
    // Redirect or respond as needed after successful authentication
    res.redirect(process.env.CLIENT_URL);
  });



module.exports = router;
