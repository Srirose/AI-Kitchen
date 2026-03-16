const express = require("express");
const verifyToken = require("../middleware/auth");
const { generateChatResponse } = require("../recipe_generator");

const router = express.Router();

// POST /api/analyze/chat — chat with AI about the meal (now FREE!)
router.post("/chat", verifyToken, async (req, res) => {
  try {
    const { messages, profile, mealPlan, imageBase64, imageMimeType } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Messages array required." });
    }

    // Use FREE rule-based recipe generator instead of paid Anthropic API
    const result = generateChatResponse(messages, profile, mealPlan);

    res.json({
      reply: result.reply,
      recipes: result.recipes || [],
      nutrients: result.nutrients || null,
      model: "NutriAI-Free",
      free: true
    });

  } catch (err) {
    console.error("Analysis error:", err.message);
    res.status(500).json({ error: "Analysis failed. Try again." });
  }
});

module.exports = router;
