const express = require('express');
const router = express.Router();
const multer = require('multer');
const { 
  uploadFoodImage, 
  analyzeVoiceInput, 
  analyzeTextInput, 
  analyzeFood,
  getNutritionInfo 
} = require('../controllers/foodController');
const { authMiddleware } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', authMiddleware, upload.single('image'), uploadFoodImage);
router.post('/voice', authMiddleware, analyzeVoiceInput);
router.post('/text', authMiddleware, analyzeTextInput);
router.post('/analyze', authMiddleware, analyzeFood);
router.get('/nutrition/:foodName', authMiddleware, getNutritionInfo);

module.exports = router;
