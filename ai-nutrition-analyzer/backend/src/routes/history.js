const express = require('express');
const router = express.Router();
const { getMealHistory, getMealById, deleteMeal, getCalendarView } = require('../controllers/historyController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, getMealHistory);
router.get('/calendar', authMiddleware, getCalendarView);
router.get('/:id', authMiddleware, getMealById);
router.delete('/:id', authMiddleware, deleteMeal);

module.exports = router;
