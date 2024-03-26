// routes/authRoutes.js

const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const oAuth2Client = require('../config/oauth2Client')

// Password reset routes
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);
router.get('/verify-reset-token', authController.verifyResetToken);

router.get('/login/success', authController.loginSuccess);
router.get('/login/failed', authController.loginFailed);

// Sign with google
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

  router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login/failed' }),
  (req, res) => {
    // Redirect or respond as needed after successful authentication
    res.redirect(process.env.CLIENT_URL);
  });

  // GMAIL oauth setup for refresh token
  router.get('/authorize', (req, res) => {
    const url = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.send'] 
    });
    res.redirect(url);
  });
  
  router.get('/oauth2callback', async (req, res) => {
    const { code } = req.query;
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    console.log(tokens)
    res.send(tokens);
  });



module.exports = router;
