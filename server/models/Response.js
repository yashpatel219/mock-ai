const mongoose = require('mongoose');

const ResponseSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question', required: true },
  answer: { type: String, required: true },
  feedback: { type: Object, required: true },
  role: { type: String, required: true },
  category: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Response', ResponseSchema);
