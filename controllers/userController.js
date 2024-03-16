// controllers/userController.js
const User = require('../models/User');
const Address = require('../models/Address');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

// Controller function to register a user
exports.registerUser = async (req, res) => {
  // Check if the email is already registered
  const existingUser = await User.findOne({ email: req.body.email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email is already registered' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(req.body.password, 10);
  const address = new Address(req.body.address);
  const savedAddress = address.save();
  // Create a new user
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    address: savedAddress._id,
    images: req.body.images,
    contact_number: req.body.contact_number,
    password: hashedPassword
  });

  try {
    const newUser = await user.save();
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
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Check if the password is correct
  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) {
    return res.status(400).json({ message: 'Invalid email or password' });
  }

  // Generate and send JWT token
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
};


exports.getAllUsers = async (req, res) => {
  try {
      const users = await User.find();
      res.json(users);
  } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'An error occurred while fetching users' });
  }
}
