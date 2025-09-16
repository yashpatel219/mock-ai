const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  responses: [
    {
      responseId: String,
      rating: Number
    }
  ],
  role: { type: String, default: "" },
  category: { type: String, default: "" }
  // remove userId completely
});

module.exports = mongoose.model("Session", SessionSchema);
