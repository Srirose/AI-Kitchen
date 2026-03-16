const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const store = require("../db/store");
const router = express.Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required." });
    }

    if (store.users[email]) {
      return res.status(409).json({ error: "Email already registered." });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    store.users[email] = {
      email,
      username,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    const token = jwt.sign(
      { email, username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.status(201).json({
      message: "Account created successfully.",
      token,
      user: { email, username },
    });
  } catch {
    res.status(500).json({ error: "Registration failed. Try again." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = store.users[email];
    if (!user) {
      return res.status(404).json({ error: "No account found. Please sign up." });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.status(401).json({ error: "Incorrect password." });
    }

    const token = jwt.sign(
      { email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.json({
      message: "Login successful.",
      token,
      user: { email: user.email, username: user.username },
    });
  } catch {
    res.status(500).json({ error: "Login failed. Try again." });
  }
});

module.exports = router;
