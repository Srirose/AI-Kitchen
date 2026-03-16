const express = require('express');
const router = express.Router();
const { createProfile, getProfile, updateProfile, getHealthMetrics } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');

router.post('/profile', authMiddleware, validate(schemas.profile), createProfile);
router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.get('/health-metrics', authMiddleware, getHealthMetrics);

module.exports = router;
