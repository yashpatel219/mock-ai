const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  sessionId: String,
  question: String,
  questionId: String, // This should be String type, not ObjectId
  answer: String,
  feedback: {
    type: Object,
    default: {}
  },
  score: Number,
  role: {
    type: String,
    default: 'candidate'
  },
  category: {
    type: String,
    default: 'general'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Response', responseSchema);