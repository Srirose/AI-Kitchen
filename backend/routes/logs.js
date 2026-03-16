const express = require("express");
const verifyToken = require("../middleware/auth");
const store = require("../db/store");
const router = express.Router();

// POST /api/logs — save meal log
router.post("/", verifyToken, (req, res) => {
  const { date, mealPlan, nutriData, messages } = req.body;
  if (!date) return res.status(400).json({ error: "Date is required." });

  const key = `${req.user.email}_${date}`;
  
  if (!store.logs[key]) {
    store.logs[key] = [];
  }
  
  store.logs[key].push({
    ...mealPlan,
    nutriData,
    messages,
    timestamp: Date.now(),
    date,
  });

  res.json({ message: "Log saved.", log: store.logs[key] });
});

// GET /api/logs — get all logs for user
router.get("/", verifyToken, (req, res) => {
  const userLogs = [];
  Object.keys(store.logs).forEach(key => {
    if (key.startsWith(`${req.user.email}_`)) {
      userLogs.push(...store.logs[key]);
    }
  });
  
  // Sort by timestamp descending
  userLogs.sort((a, b) => b.timestamp - a.timestamp);
  
  res.json({ logs: userLogs });
});

// GET /api/logs/:date — get logs for specific date
router.get("/:date", verifyToken, (req, res) => {
  const { date } = req.params;
  const key = `${req.user.email}_${date}`;
  const logs = store.logs[key] || [];
  
  res.json({ logs });
});

module.exports = router;
