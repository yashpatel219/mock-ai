const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);


// Static fallback feedback
const fallbackFeedback = {
  strengths: ["You provided an answer to the question", "Shows basic understanding of the topic", "Demonstrates effort in structuring the response"],
  weaknesses: ["Could include more specific examples", "Needs better alignment with the question", "Could improve clarity and conciseness"],
  improvements: ["Use the STAR method to structure answers", "Provide concrete examples", "Practice speaking clearly and confidently"],
  rating: 3.5,
  detailedAnalysis: "Unable to generate AI feedback at the moment. Please review your answer and focus on giving structured, detailed responses using the STAR method."
};

// POST /api/review
router.post("/", async (req, res) => {
  try {
    const { question, answer, role, category } = req.body;

    if (!answer) {
      return res.status(400).json({ error: "Answer is required" });
    }

    let model;
    try {
      model = genAI.getGenerativeModel({ model: "gemini-pro" });
    } catch (modelError) {
      console.error("Error getting Gemini model:", modelError);
      return res.json({ feedback: fallbackFeedback });
    }

    const prompt = `
      You are an experienced interview coach specializing in ${role} positions. 
      Provide detailed feedback on the following interview response using the STAR method (Situation, Task, Action, Result).

      QUESTION: ${question}
      CATEGORY: ${category}
      CANDIDATE'S ANSWER: ${answer}

      Please provide feedback in the following JSON format:
      {
        "strengths": ["strength1", "strength2", "strength3"],
        "weaknesses": ["weakness1", "weakness2", "weakness3"],
        "improvements": ["improvement1", "improvement2", "improvement3"],
        "rating": number (between 1-5),
        "detailedAnalysis": "2-3 paragraph detailed analysis"
      }
    `;

    let text = "";
    try {
      const result = await model.generateContent(prompt);
      if (result && typeof result.response === "function") {
        text = await result.response();
        if (text.text) text = text.text();
      } else if (result && result.response && typeof result.response.text === "function") {
        text = result.response.text();
      } else {
        text = result.toString();
      }
    } catch (genError) {
      console.error("Error generating content from Gemini:", genError);
      return res.json({ feedback: fallbackFeedback });
    }

    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const feedback = JSON.parse(jsonMatch[0]);
        return res.json({ feedback });
      } else {
        return res.json({ feedback: fallbackFeedback });
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response JSON:", parseError);
      return res.json({ feedback: fallbackFeedback });
    }

  } catch (error) {
    console.error("Unexpected error in /api/review:", error);
    return res.json({ feedback: fallbackFeedback });
  }
});

module.exports = router;
