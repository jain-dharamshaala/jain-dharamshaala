// models/Address.js
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  line1: { type: String, required: true },
  line2: { type: String },
  city: { type: String, required: true },
  state: { type: String },
  country: { type: String, required: true },
  pincode: { type: String, required: true }
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
