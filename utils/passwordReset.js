// utils/passwordReset.js

const crypto = require('crypto');
const nodemailer = require('nodemailer');
const {sendPasswordResetEmail} = require('../modules/email/emailSender')

// Function to generate a random reset token
const generateResetToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

// Function to send a password reset email
const sendPasswordResetEmailUtil = async (email, resetToken) => {
  return sendPasswordResetEmail(email, resetToken);
};

module.exports = { generateResetToken, sendPasswordResetEmailUtil };
