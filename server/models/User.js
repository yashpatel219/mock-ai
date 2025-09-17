const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  paid: { type: Boolean, default: false },

  // New profile fields
  desiredPosition: { type: String, default: "" },
  experience: { type: Number, default: 0 },
  department: { type: String, default: "" },
  industry: { type: String, default: "" },
  location: { type: String, default: "" },
  targetCompany: { type: String, default: "" },
});

module.exports = mongoose.model('User', userSchema);
z