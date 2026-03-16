const { UserProfile } = require('../models');

const createProfile = async (req, res) => {
  try {
    const { userId, email } = req.user;
    const profileData = req.body;

    let user = await UserProfile.findOne({ userId });

    if (user) {
      return res.status(409).json({
        success: false,
        message: 'Profile already exists. Use PUT to update.'
      });
    }

    user = new UserProfile({
      userId,
      email,
      ...profileData
    });

    user.calculateBMI();
    user.calculateBMR();
    user.calculateDailyCalorieTarget();

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Profile created successfully',
      data: {
        user: {
          name: user.name,
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          activityLevel: user.activityLevel,
          fitnessGoal: user.fitnessGoal,
          foodAllergies: user.foodAllergies,
          healthConditions: user.healthConditions,
          bmi: user.bmi,
          bmr: user.bmr,
          dailyCalorieTarget: user.dailyCalorieTarget
        }
      }
    });
  } catch (error) {
    console.error('Create profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating profile'
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await UserProfile.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          name: user.name,
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          activityLevel: user.activityLevel,
          fitnessGoal: user.fitnessGoal,
          foodAllergies: user.foodAllergies,
          healthConditions: user.healthConditions,
          bmi: user.bmi,
          bmr: user.bmr,
          dailyCalorieTarget: user.dailyCalorieTarget,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving profile'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const updates = req.body;

    const user = await UserProfile.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    });

    if (updates.weight || updates.height || updates.age || updates.gender) {
      user.calculateBMI();
      user.calculateBMR();
      user.calculateDailyCalorieTarget();
    }

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          name: user.name,
          age: user.age,
          height: user.height,
          weight: user.weight,
          gender: user.gender,
          activityLevel: user.activityLevel,
          fitnessGoal: user.fitnessGoal,
          foodAllergies: user.foodAllergies,
          healthConditions: user.healthConditions,
          bmi: user.bmi,
          bmr: user.bmr,
          dailyCalorieTarget: user.dailyCalorieTarget
        }
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

const getHealthMetrics = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await UserProfile.findOne({ userId });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    let bmiCategory = '';
    if (user.bmi < 18.5) bmiCategory = 'Underweight';
    else if (user.bmi < 25) bmiCategory = 'Normal weight';
    else if (user.bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    res.json({
      success: true,
      data: {
        bmi: {
          value: user.bmi,
          category: bmiCategory
        },
        bmr: user.bmr,
        dailyCalorieTarget: user.dailyCalorieTarget,
        activityLevel: user.activityLevel,
        fitnessGoal: user.fitnessGoal
      }
    });
  } catch (error) {
    console.error('Get health metrics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving health metrics'
    });
  }
};

module.exports = {
  createProfile,
  getProfile,
  updateProfile,
  getHealthMetrics
};
