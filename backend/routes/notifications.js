const express = require("express");
const verifyToken = require("../middleware/auth");
const personalizationService = require("../services/personalizationService");

const router = express.Router();

// GET /api/notifications - Get user notifications
router.get("/", verifyToken, async (req, res) => {
  try {
    const notifications = await personalizationService.getUserNotifications(req.user.email);
    res.json({ notifications });
  } catch (err) {
    console.error("Notifications error:", err.message);
    res.status(500).json({ error: "Failed to fetch notifications." });
  }
});

// PUT /api/notifications/:id/read - Mark notification as read
router.put("/:id/read", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const success = await personalizationService.markNotificationRead(id);
    
    if (success) {
      res.json({ message: "Notification marked as read." });
    } else {
      res.status(404).json({ error: "Notification not found." });
    }
  } catch (err) {
    console.error("Mark read error:", err.message);
    res.status(500).json({ error: "Failed to mark notification as read." });
  }
});

// POST /api/ingredients/store - Store used ingredients
router.post("/ingredients", verifyToken, async (req, res) => {
  try {
    const { ingredients, mealType, date } = req.body;
    
    if (!ingredients || !mealType || !date) {
      return res.status(400).json({ error: "Ingredients, meal type, and date required." });
    }

    const success = await personalizationService.storeIngredients(
      req.user.email,
      ingredients,
      mealType,
      date
    );

    res.json({ message: "Ingredients stored successfully." });
  } catch (err) {
    console.error("Store ingredients error:", err.message);
    res.status(500).json({ error: "Failed to store ingredients." });
  }
});

// GET /api/ingredients/frequent - Get frequently used ingredients
router.get("/ingredients/frequent", verifyToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const frequent = await personalizationService.getFrequentIngredients(
      req.user.email,
      parseInt(limit)
    );
    
    res.json({ ingredients: frequent });
  } catch (err) {
    console.error("Frequent ingredients error:", err.message);
    res.status(500).json({ error: "Failed to fetch frequent ingredients." });
  }
});

// POST /api/recipes/store - Store recipe
router.post("/recipes", verifyToken, async (req, res) => {
  try {
    const { recipe } = req.body;
    
    if (!recipe) {
      return res.status(400).json({ error: "Recipe data required." });
    }

    const success = await personalizationService.storeRecipe(req.user.email, recipe);
    res.json({ message: "Recipe stored successfully." });
  } catch (err) {
    console.error("Store recipe error:", err.message);
    res.status(500).json({ error: "Failed to store recipe." });
  }
});

module.exports = router;
