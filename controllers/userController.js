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

dotenv.config();

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

// extract this in different module..
const sendEmailUsingOAuth2 = async (token) => {
  try {
    // Create a Nodemailer transporter with OAuth2 authentication
    const transporter = await getTransporter();
    const emailTemplate = fs.readFileSync('public/email-templates/verify-email.html', 'utf8');
        // Replace the '{{ token }}' placeholder with the generated token in the email template
    const formattedEmail = emailTemplate.replace('{{ token }}', token);
    console.log(formattedEmail);
    // Construct email message
    const mailOptions = {
      from: 'jain-dharamshaala@gmail.com',
      to: "aashaysinghai26@gmail.com",
      subject: 'Verify Email for Jain-Dharamshaala :)',
      html: formattedEmail
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent for verification :', info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// Controller function to register a user
exports.registerUser = async (req, res) => {
  // Check if the email is already registered
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered" });
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
    // TODO send welcome email upon sucessfull creation of account.
    //  and other notification for password reset and updating prifiles.
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to login a user
exports.loginUser = async (req, res) => {
  // Check if the email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

  // Check if the password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: "Invalid email or password" });
  }

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
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const {id} = req.params;
    const user = await User.findById(id);
    res.json(user);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "An error occurred while fetching users" });
  }
};


exports.verifyEmail =  async (req, res) => {
    try {
        const { token } = req.query;

        // Find the user with the corresponding verification token
        const user = await User.findOne({ verificationToken: token });
        console.log(user);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token' });
        }

        // Mark the user as verified and clear the verification token
        user.verified = true;
        user.verificationToken = undefined;
        await user.save();

        // Redirect the user to a success page or display a success message
        res.redirect('/api/users/verification-success');
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
