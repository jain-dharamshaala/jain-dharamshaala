// controllers/userController.js
const User = require("../models/User");
const Address = require("../models/Address");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { check, validationResult } = require('express-validator');
const crypto = require('crypto');
const oAuth2Client = require('../config/oauth2Client')
const nodemailer = require('nodemailer');
const fs = require('fs');
const {sendEmailUsingOAuth2} = require('../modules/email/emailSender')
const statusCodes = require("../utils/constants/statusCodes");

dotenv.config();

// Functionality



const validateRegistration = [
  check("name").notEmpty().withMessage("Name is required"),
  check("email").isEmail().withMessage("Invalid email format"),
  check("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const getTransporter = async () => {
  const accessToken = await oAuth2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: 'jain.dharamshaala@gmail.com',
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
  return transporter;
}

const generateUniqueToken = (length = 8) => {
  return new Promise((resolve, reject) => {
      crypto.randomBytes(length, (err, buffer) => {
          if (err) {
              reject(err);
          } else {
              const token = buffer.toString('hex').slice(0, length);
              resolve(token);
          }
      });
  });
};

// Controller function to register a user
exports.registerUser = async (req, res) => {
  // Check if the email is already registered
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(statusCodes.BAD_REQUEST).json({ errors: errors.array() });
  }
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(statusCodes.BAD_REQUEST).json({ message: "Email is already registered" });
  }
  console.log("Sending verify-email with token.");
  const token = await generateUniqueToken();
  // this will prcess async.
  sendEmailUsingOAuth2();

  // Hash the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  // const address = new Address(req.body.address);
  // const savedAddress = address.save();
  // Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    // address: savedAddress._id,
    // images: req.body.images,
    contact_number: req.body.contact_number,
    password: hashedPassword,
    verified: false,
    verificationToken: token
  });

  try {
    const newUser = await user.save();
    req.session.userId = user._id
    // TODO send welcome email upon sucessfull creation of account.
    //  and other notification for password reset and updating prifiles.
    res.status(statusCodes.CREATED).json(newUser);
  } catch (err) {
    res.status(statusCodes.BAD_REQUEST).json({ message: err.message });
  }
};


// Controller function to login a user
exports.loginUser = async (req, res) => {
  // Check if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(statusCodes.BAD_REQUEST).json({ message: "Invalid email or password" });
  }

  // Check if the password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(statusCodes.BAD_REQUEST).json({ message: "Invalid email or password" });
  }
  req.session.userId = user._id; 

  // Generate and send JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  // generate a seesion based authentication by "express-session" package.
  res.json({ token });
};


exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching users" });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const {id} = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching users" });
  }
};


exports.getProfile = async (req, res) => {
  try {
    console.log(req.session);
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching users" });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const { name, email, contactNumber } = req.body;
    if (!name || !email || !contactNumber) {
      return res.status(statusCodes.BAD_REQUEST).json({ message: 'Please provide all required fields' });
    }

    let user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(statusCodes.NOT_FOUND).json({ message: 'User not found' });
    }

    user.name = name;
    user.email = email;
    user.contact_number = contactNumber;
    // TODO handle the address later.

    await user.save(); 
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(statusCodes.INTERNAL_SERVER_ERROR).send('Server Error');
  }
};



exports.verifyEmail =  async (req, res) => {
    try {
        const { token } = req.query;

        // Find the user with the corresponding verification token
        const user = await User.findOne({ verificationToken: token });
        console.log(user);

        if (!user) {
            return res.status(statusCodes.BAD_REQUEST).json({ message: 'Invalid or expired token' });
        }

        // Mark the user as verified and clear the verification token
        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect the user to a success page or display a success message
        res.redirect('/api/users/verification-success');
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    }
};


exports.logoutUser = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error logging out:', err);
      res.status(statusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Internal server error' });
    } else {
      res.json({ message: 'Logout successful' });
    }
  });
};


exports.verificationSuccess = (req, res) => {
  res.send('<h2>Email Verification Successful</h2><p>Your email address has been successfully verified.</p>');
};
