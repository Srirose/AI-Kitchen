const express = require("express");
const multer = require("multer");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files allowed."));
  },
});

const YOLO_SERVICE_URL = process.env.YOLO_SERVICE_URL || "http://localhost:5001";

// Detect ingredients from image using YOLOv8 service
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Convert image to base64 and send to YOLO service
    const base64 = req.file.buffer.toString("base64");

    const response = await fetch(`${YOLO_SERVICE_URL}/detect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ image: base64 }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `YOLO service error: ${response.status}`);
    }

    const data = await response.json();

    // Return ingredients to frontend
    res.json({
      ingredients: data.ingredients || [],
      count: data.count || 0,
      message: data.message,
      model: data.model || "YOLOv8"
    });

  } catch (err) {
    console.error("Ingredient detection error:", err.message);
    res.status(500).json({ 
      error: err.message || "Detection failed. Try again." 
    });
  }
});

// Health check for YOLO service
router.get("/health", async (req, res) => {
  try {
    const response = await fetch(`${YOLO_SERVICE_URL}/health`);
    const data = await response.json();
    res.json({ status: "ok", yolo_service: data });
  } catch {
    res.status(503).json({ 
      status: "error", 
      message: "YOLO service not available" 
    });
  }
});

module.exports = router;
