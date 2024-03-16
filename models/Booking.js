// models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  dharamshaala_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Dharamshaala', required: true },
  room_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  checkin_date: { type: Date, required: true },
  checkout_date: { type: Date, required: true },
  per_night_price: { type: Number, required: true },
  total_price: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date }
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
