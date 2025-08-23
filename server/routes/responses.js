const express = require('express');
const router = express.Router();
const Response = require('../models/Response'); // make sure you have this model

// Get all responses
router.get('/', async (req, res) => {
  try {
    const responses = await Response.find();
    res.json(responses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new response
router.post('/', async (req, res) => {
  try {
    const { questionId, answer, feedback, role, category } = req.body;
    const newResponse = await Response.create({ questionId, answer, feedback, role, category });
    res.json({ message: 'Response saved', sessions: [newResponse] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
