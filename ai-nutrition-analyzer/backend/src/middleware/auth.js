const jwt = require('jsonwebtoken');
const { verifyFirebaseToken } = require('../config/firebase');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7);
    
    let decoded = verifyToken(token);
    
    if (!decoded) {
      const firebaseDecoded = await verifyFirebaseToken(token);
      if (firebaseDecoded) {
        decoded = {
          userId: firebaseDecoded.uid,
          email: firebaseDecoded.email
        };
      }
    }

    if (!decoded) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      let decoded = verifyToken(token);
      
      if (!decoded) {
        const firebaseDecoded = await verifyFirebaseToken(token);
        if (firebaseDecoded) {
          decoded = {
            userId: firebaseDecoded.uid,
            email: firebaseDecoded.email
          };
        }
      }
      
      if (decoded) {
        req.user = decoded;
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

module.exports = {
  authMiddleware,
  optionalAuthMiddleware,
  generateToken,
  verifyToken
};
