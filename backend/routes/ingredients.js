const express = require("express");
const multer = require("multer");
const { detectIngredientsSmart, searchWithEdamam } = require("../services/ingredientDetector");

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

// Detect ingredients from image using YOLOv8 + Spoonacular/Edamam
router.post("/detect", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No image uploaded." });
    }

    // Convert image to base64
    const base64 = req.file.buffer.toString("base64");

    // Try YOLO service first (if available)
    let yoloResult = null;
    try {
      const yoloResponse = await fetch(`${YOLO_SERVICE_URL}/detect`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: base64 }),
      });

      if (yoloResponse.ok) {
        yoloResult = await yoloResponse.json();
      }
    } catch (err) {
      console.log("YOLO service not available, using APIs only");
    }

    // Use smart detection with Spoonacular and Edamam
    const apiResult = await detectIngredientsSmart(
      base64,
      yoloResult?.ingredients?.join(", ") || null
    );

    // Combine results if YOLO detected something
    let finalIngredients = apiResult.ingredients;
    if (yoloResult && yoloResult.ingredients && yoloResult.ingredients.length > 0) {
      // Merge YOLO detections with API enrichments
      const yoloIngs = yoloResult.ingredients.map(ing => ({
        name: ing,
        confidence: 0.7,
        source: 'yolo'
      }));
      
      // Remove duplicates and combine
      const allNames = new Set([
        ...yoloIngs.map(i => i.name.toLowerCase()),
        ...apiResult.ingredients.map(i => i.name.toLowerCase())
      ]);
      
      finalIngredients = [
        ...yoloIngs.filter(i => !apiResult.ingredients.some(
          api => api.name.toLowerCase() === i.name.toLowerCase()
        )),
        ...apiResult.ingredients
      ];
    }

    // Return combined ingredients to frontend
    res.json({
      ingredients: finalIngredients.map(i => i.name),
      detailedIngredients: finalIngredients,
      count: finalIngredients.length,
      message: apiResult.message,
      model: `YOLO + ${apiResult.model}`,
      primarySource: apiResult.primarySource
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

// Search ingredients by text using Edamam
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: "Search query is required" });
    }

    const result = await searchWithEdamam(query);
    
    res.json({
      ingredients: result.ingredients,
      count: result.count,
      hints: result.hints,
      model: result.model
    });

  } catch (err) {
    console.error("Ingredient search error:", err.message);
    res.status(500).json({ 
      error: err.message || "Search failed. Try again." 
    });
  }
});

module.exports = router;
