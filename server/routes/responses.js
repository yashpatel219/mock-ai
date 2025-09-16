const express = require('express');
const router = express.Router();
const Response = require('../models/Response'); // Make sure this path is correct

router.post('/', async (req, res) => {
  try {
    console.log('=== REQUEST BODY ===');
    console.log(JSON.stringify(req.body, null, 2));
    
    const { sessionId, question, answer, score, feedback, questionId } = req.body;
    
    // Make sessionId optional or generate one
    const finalSessionId = sessionId || `temp-session-${Date.now()}`;
    
    // Check if required fields are present
    if (!question && !questionId) {
      console.log('Missing question/questionId');
      return res.status(400).json({ 
        error: 'Missing question or questionId' 
      });
    }
    
    if (answer === undefined) {
      console.log('Missing answer');
      return res.status(400).json({ 
        error: 'Missing answer' 
      });
    }

    console.log('All required fields present, creating response...');
    
    // For now, handle questionId as string to avoid ObjectId validation errors
    const responseData = { 
      sessionId: finalSessionId,
      question: question || `Question ${questionId}`,
      answer, 
      feedback: feedback || '',
      score: score || null,
      role: req.body.role || 'candidate',
      category: req.body.category || 'general'
    };
    
    // Only add questionId if it exists and handle it appropriately
    if (questionId) {
      responseData.questionId = questionId;
    }
    
    const newResponse = await Response.create(responseData);
    
    res.json({ 
      message: 'Response saved successfully', 
      response: newResponse 
    });
    
  } catch (err) {
    console.error('Error saving response:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message 
    });
  }
});

module.exports = router;