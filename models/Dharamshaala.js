// models/Dharamshaala.js
const mongoose = require('mongoose');

const dharamshaalaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  amenities: [{ type: String }],
  images: [{ type: String }],
  rooms: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Room'}],
  city: { type: String, required: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address', required: true },
  best_image: { type: String },
  cancellation_policy: [{ type: String }],
  restrictions: [{ type: String }],
});

const Dharamshaala = mongoose.model('Dharamshaala', dharamshaalaSchema);

module.exports = Dharamshaala;
