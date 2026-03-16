const { UserProfile } = require('../models');
const { generateToken } = require('../middleware/auth');

const signup = async (req, res) => {
  try {
    const { email, name, firebaseUid } = req.body;
    
    let user = await UserProfile.findOne({ email });
    
    if (user) {
      return res.status(409).json({
        success: false,
        message: 'User already exists'
      });
    }

    const token = generateToken(firebaseUid || email, email);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          email,
          name,
          profileComplete: false
        }
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during signup'
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, firebaseUid } = req.body;
    
    const user = await UserProfile.findOne({ email });
    const token = generateToken(firebaseUid || email, email);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user ? {
          ...user.toObject(),
          profileComplete: true
        } : {
          email,
          profileComplete: false
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login'
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { userId, email } = req.user;
    const newToken = generateToken(userId, email);

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Error refreshing token'
    });
  }
};

module.exports = {
  signup,
  login,
  refreshToken
};
