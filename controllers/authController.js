// controllers/authController.js

const User = require('../models/User');

const { generateResetToken, sendPasswordResetEmailUtil } = require('../utils/passwordReset');
const RESET_TOKEN_EXPIRY = 1 * 60 * 60 * 1000; // 1 hour

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  // Generate unique reset token
  const resetToken = generateResetToken();

  // Save reset token and expiry time in the database for the user
  await User.findOneAndUpdate({ email }, { resetToken, resetTokenExpiry: Date.now() + RESET_TOKEN_EXPIRY });

  // Send password reset email containing the reset link
  await sendPasswordResetEmailUtil(email, resetToken);

  res.json({ message: 'Password reset email sent successfully' });
};

exports.resetPassword = async (req, res) => {
  const { email, resetToken, newPassword } = req.body;

  // Find user by email and validate reset token
  const user = await User.findOne({ email, resetToken, resetTokenExpiry: { $gt: Date.now() } });
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }

  // Update user's password
  user.password = newPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
};
