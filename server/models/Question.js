// models/Question.js
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  role: { type: String, required: true },
  category: { type: String, required: true },
  text: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Question", QuestionSchema);
