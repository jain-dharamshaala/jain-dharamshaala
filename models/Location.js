// models/Location.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationSchema = new Schema({
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  displayName: { type: String, required: true },
  locationType: { type: String, required: true },
  name: { type: String, required: true },
  address: { type: Schema.Types.ObjectId, ref: 'Address' }
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;