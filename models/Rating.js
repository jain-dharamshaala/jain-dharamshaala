// models/Rating.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ratingSchema = new Schema({
    dharamshaala: { type: Schema.Types.ObjectId, ref: 'Dharamshaala', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    count: { type: Number, default: 0 },
    rating_breakup: [
        {
          rating: { type: Number, required: true,min: 1, max: 5 },
          count: { type: Number, required: true },
        },],
});

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;