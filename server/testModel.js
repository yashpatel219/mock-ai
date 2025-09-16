const { TextServiceClient } = require('@google-ai/generativelanguage');
require('dotenv').config();

const client = new TextServiceClient({ apiKey: process.env.GEMINI_API_KEY });

async function testGenerate() {
  try {
    const [response] = await client.generateText({
      model: 'text-bison-001',
      // ✅ prompt must be an object
      prompt: {
        text: 'Hello, generate a short feedback for a candidate answer.'
      },
      temperature: 0.7,
      maxOutputTokens: 100
    });

    console.log("Generated text:", response.candidates[0].content);
  } catch (err) {
    console.error("Error generating text:", err);
  }
}

testGenerate();
