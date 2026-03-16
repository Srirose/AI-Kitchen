const express = require('express');
const router = express.Router();
const { signup, login, refreshToken } = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');
const { authMiddleware } = require('../middleware/auth');

router.post('/signup', validate(schemas.signup), signup);
router.post('/login', validate(schemas.login), login);
router.post('/refresh', authMiddleware, refreshToken);

module.exports = router;
