// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  images: [{ type: String }],
  contact_number: { type: String },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
