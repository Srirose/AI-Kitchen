const express = require('express');
const router = express.Router();
const { getRecommendations, getSustainabilityTips } = require('../controllers/recommendationController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getRecommendations);
router.get('/sustainability-tips', authMiddleware, getSustainabilityTips);

module.exports = router;
