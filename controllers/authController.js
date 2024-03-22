// controllers/authController.js

const bcrypt = require("bcrypt");
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
  // Hash the password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  res.json({ message: 'Password reset successful' });
};

exports.verifyResetToken = async (req, res) => {
  const { token: resetToken,email } = req.query;

  // Find user by email and validate reset token
  const user = await User.findOne({email, resetToken});
  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset token' });
  }
  res.json({ message: 'User is authentic with verify token.' });
};

exports.loginSuccess = async (req, res) => {
  if(req.user){
    res.status(200).json({
      error: false,
      user:req.user,
    })
  }else{
    res.status(403).json({error:true,message:'Not Authorised'});
  }
};

exports.loginFailed = async (req, res) => {
    res.status(401).json({error:true,message:'Login Failure'});
 
};
