// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  address: { type: mongoose.Schema.Types.ObjectId, ref: 'Address' },
  images: [{ type: String }],
  contact_number: { type: String },
  password: { type: String, required: true },
  verified: { type: Boolean },
  verificationToken: {type: String}
});

// TODO use these hooks
// // Hash password before saving
// userSchema.pre('save', async function(next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Method to compare passwords
// userSchema.methods.comparePassword = async function(candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

const User = mongoose.model('User', userSchema);

module.exports = User;
