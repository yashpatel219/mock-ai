const express = require('express');
const router = express.Router();
const Session = require('../models/Session'); 

// Get all sessions
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find().sort({ createdAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { responses = [], role = '', category = '' } = req.body;

    const newSession = await Session.create({ responses, role, category });
    res.json(newSession);
  } catch (err) {
    console.error("❌ Error creating session:", err);
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  try {
    const { responseId, rating } = req.body;

    const session = await Session.findById(req.params.id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    session.responses.push({ responseId, rating });
    await session.save();

    res.json(session);
  } catch (err) {
    console.error("❌ Error updating session:", err);
    res.status(500).json({ error: err.message });
  }
});



// PATCH /api/sessions/current
router.patch('/current', async (req, res) => {
  try {
    const { responseId, rating } = req.body;

    // Get the latest session
    let session = await Session.findOne().sort({ createdAt: -1 });

    // If no session exists, create one
    if (!session) {
      session = new Session({ responses: [], role: '', category: '' });
    }

    session.responses.push({ responseId, rating });
    await session.save();

    res.json(session);
  } catch (err) {
    console.error("❌ Error updating current session:", err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
