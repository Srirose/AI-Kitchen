const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const userRoutes = require('./user');
const foodRoutes = require('./food');
const nutritionRoutes = require('./nutrition');
const recommendationRoutes = require('./recommendations');
const historyRoutes = require('./history');

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/food', foodRoutes);
router.use('/nutrition', nutritionRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/history', historyRoutes);

router.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = router;
