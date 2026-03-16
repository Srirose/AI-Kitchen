const axios = require('axios');
const { UserProfile } = require('../models');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

const getRecommendations = async (req, res) => {
  try {
    const { userId } = req.user;
    const { mealType, count = 5 } = req.query;

    const user = await UserProfile.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const response = await axios.post(`${AI_SERVICE_URL}/api/recommendations`, {
      userProfile: {
        bmi: user.bmi,
        bmr: user.bmr,
        dailyCalorieTarget: user.dailyCalorieTarget,
        fitnessGoal: user.fitnessGoal,
        foodAllergies: user.foodAllergies,
        healthConditions: user.healthConditions
      },
      mealType,
      count: parseInt(count)
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Get recommendations error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendations'
    });
  }
};

const getSustainabilityTips = async (req, res) => {
  try {
    const { userId } = req.user;

    const response = await axios.get(`${AI_SERVICE_URL}/api/sustainability/tips`, {
      params: { userId }
    });

    res.json({
      success: true,
      data: response.data
    });
  } catch (error) {
    console.error('Get sustainability tips error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving sustainability tips'
    });
  }
};

module.exports = {
  getRecommendations,
  getSustainabilityTips
};
