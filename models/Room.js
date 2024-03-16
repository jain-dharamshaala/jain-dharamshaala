// models/Room.js
const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  room_number: { type: String, required: true },
  dharamshaala_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dharamshaala', required: true },
  type: { type: String },
  amenities: [{ type: String }],
  images: [{ type: String }],
  checkin_time: { type: String },
  checkout_time: { type: String },
  status: { type: String, enum: ['available', 'booked'], default: 'available' }
});

const Room = mongoose.model('Room', roomSchema);

module.exports = Room;
