const express = require('express');
const router = express.Router();
const Session = require('../models/Session'); // make sure you have this model

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new session
router.post('/', async (req, res) => {
  try {
    const { userId, responses } = req.body;
    const newSession = await Session.create({ userId, responses });
    res.json(newSession);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
