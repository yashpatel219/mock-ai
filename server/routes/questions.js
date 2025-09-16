const express = require('express');
const router = express.Router();
const Question = require('../models/Question');

// @desc    Get all questions
// @route   GET /api/questions
router.get('/', async (req, res) => {
  try {
    const questions = await Question.find().sort({ createdAt: -1 });
    res.json(questions);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get questions by role & category
// @route   POST /api/questions/filter
// @desc    Get questions by role & category
// @route   POST /api/questions/filter
router.post('/filter', async (req, res) => {
  const { role, category } = req.body;

  console.log("Searching for role:", role);
  console.log("Searching for category:", category);

  if (!role || !category) {
    return res.status(400).json({ message: 'Role and category are required' });
  }

  try {
    // Query MongoDB
    const questions = await Question.find({ role, category });

    // 👇 Add this log here
    console.log("Questions found:", questions.length);

    // Send response to frontend
    res.json({ success: true, questions });
  } catch (err) {
    console.error("Error fetching questions:", err);
    res.status(500).json({ message: 'Server error' });
  }
});


// @desc    Add a question (admin only)
// @route   POST /api/questions
router.post('/', async (req, res) => {
  const { role, category, text } = req.body;
  if (!role || !category || !text) return res.status(400).json({ message: 'All fields are required' });

  try {
    const newQuestion = await Question.create({ role, category, text });
    res.status(201).json(newQuestion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
