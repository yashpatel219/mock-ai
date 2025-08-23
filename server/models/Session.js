const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  responses: { type: Array, default: [] },
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
