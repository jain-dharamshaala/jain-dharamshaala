// models/UserRating.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userRatingsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  dharamshaala: { type: Schema.Types.ObjectId, ref: 'Dharamshaala', required: true },
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comments: { type: String },
});

const UserRating = mongoose.model('UserRating', userRatingsSchema);

module.exports = UserRating;