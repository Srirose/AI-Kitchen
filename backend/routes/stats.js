const express = require("express");
const verifyToken = require("../middleware/auth");
const personalizationService = require("../services/personalizationService");

const router = express.Router();

// GET /api/stats/daily/:date - Get daily stats with comparison
router.get("/daily/:date", verifyToken, async (req, res) => {
  try {
    const { date } = req.params;
    const statsData = await personalizationService.getUserHistory(
      req.user.email, 
      date, 
      date
    );
    
    if (statsData.length === 0) {
      return res.status(404).json({ error: "No stats found for this date." });
    }

    res.json({ stats: statsData[0] });
  } catch (err) {
    console.error("Daily stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch daily stats." });
  }
});

// GET /api/stats/weekly - Get weekly summary
router.get("/weekly", verifyToken, async (req, res) => {
  try {
    // Calculate current week start and end
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    
    const weekStart = new Date(now.setDate(diff)).toISOString().split('T')[0];
    const weekEnd = new Date(now.setDate(diff + 6)).toISOString().split('T')[0];

    const summary = await personalizationService.generateWeeklySummary(
      req.user.email,
      weekStart,
      weekEnd
    );

    if (!summary) {
      return res.status(404).json({ error: "No weekly data available yet." });
    }

    res.json({ summary });
  } catch (err) {
    console.error("Weekly stats error:", err.message);
    res.status(500).json({ error: "Failed to fetch weekly summary." });
  }
});

// GET /api/stats/history - Get user's nutrition history with optional date range
router.get("/history", verifyToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const history = await personalizationService.getUserHistory(
      req.user.email,
      startDate,
      endDate
    );

    res.json({ history, count: history.length });
  } catch (err) {
    console.error("History error:", err.message);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

// POST /api/stats/log - Log meal and calculate stats
router.post("/log", verifyToken, async (req, res) => {
  try {
    const { date, mealPlan, profile } = req.body;
    
    if (!date || !mealPlan) {
      return res.status(400).json({ error: "Date and meal plan required." });
    }

    const stats = await personalizationService.storeDailyStats(
      req.user.email,
      date,
      mealPlan,
      profile
    );

    res.json({ stats });
  } catch (err) {
    console.error("Log stats error:", err.message);
    res.status(500).json({ error: "Failed to log stats." });
  }
});

module.exports = router;
