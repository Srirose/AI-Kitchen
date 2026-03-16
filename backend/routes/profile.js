const express = require("express");
const verifyToken = require("../middleware/auth");
const store = require("../db/store");
const router = express.Router();

// GET /api/profile — load profile
router.get("/", verifyToken, (req, res) => {
  const profile = store.profiles[req.user.email];
  if (!profile) {
    return res.status(404).json({ error: "Profile not found." });
  }
  res.json({ profile });
});

// POST /api/profile — save/update profile
router.post("/", verifyToken, (req, res) => {
  const { profile } = req.body;
  if (!profile) {
    return res.status(400).json({ error: "Profile data required." });
  }

  store.profiles[req.user.email] = {
    ...profile,
    email: req.user.email,       // always enforce email from token
    username: req.user.username, // always enforce username from token
    updatedAt: new Date().toISOString(),
  };

  res.json({ message: "Profile saved.", profile: store.profiles[req.user.email] });
});

module.exports = router;
