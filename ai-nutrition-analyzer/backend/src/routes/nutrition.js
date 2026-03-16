const express = require('express');
const router = express.Router();
const { getDailyReport, getWeeklyReport } = require('../controllers/nutritionController');
const { authMiddleware } = require('../middleware/auth');

router.get('/report/daily', authMiddleware, getDailyReport);
router.get('/report/weekly', authMiddleware, getWeeklyReport);

module.exports = router;
