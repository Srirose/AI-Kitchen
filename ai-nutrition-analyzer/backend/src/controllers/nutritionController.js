const { MealHistory, UserProfile } = require('../models');

const getDailyReport = async (req, res) => {
  try {
    const { userId } = req.user;
    const { date } = req.query;
    
    const targetDate = date ? new Date(date) : new Date();
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const user = await UserProfile.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    const meals = await MealHistory.find({
      userId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).sort({ date: 1 });

    const dailyTotals = meals.reduce((acc, meal) => {
      acc.calories += meal.totalNutrition?.calories || 0;
      acc.protein += meal.totalNutrition?.protein || 0;
      acc.carbohydrates += meal.totalNutrition?.carbohydrates || 0;
      acc.fat += meal.totalNutrition?.fat || 0;
      acc.fiber += meal.totalNutrition?.fiber || 0;
      acc.sustainabilityScore += meal.sustainability?.sustainabilityScore || 0;
      return acc;
    }, {
      calories: 0,
      protein: 0,
      carbohydrates: 0,
      fat: 0,
      fiber: 0,
      sustainabilityScore: 0
    });

    if (meals.length > 0) {
      dailyTotals.sustainabilityScore = dailyTotals.sustainabilityScore / meals.length;
    }

    const remainingCalories = user.dailyCalorieTarget - dailyTotals.calories;

    res.json({
      success: true,
      data: {
        date: startOfDay,
        dailyTarget: user.dailyCalorieTarget,
        consumed: dailyTotals,
        remaining: remainingCalories,
        meals: meals.map(meal => ({
          id: meal._id,
          mealType: meal.mealType,
          time: meal.date,
          nutrition: meal.totalNutrition,
          sustainability: meal.sustainability
        })),
        macroBreakdown: {
          protein: {
            grams: dailyTotals.protein,
            calories: dailyTotals.protein * 4,
            percentage: dailyTotals.calories > 0 ? ((dailyTotals.protein * 4) / dailyTotals.calories * 100).toFixed(1) : 0
          },
          carbohydrates: {
            grams: dailyTotals.carbohydrates,
            calories: dailyTotals.carbohydrates * 4,
            percentage: dailyTotals.calories > 0 ? ((dailyTotals.carbohydrates * 4) / dailyTotals.calories * 100).toFixed(1) : 0
          },
          fat: {
            grams: dailyTotals.fat,
            calories: dailyTotals.fat * 9,
            percentage: dailyTotals.calories > 0 ? ((dailyTotals.fat * 9) / dailyTotals.calories * 100).toFixed(1) : 0
          }
        }
      }
    });
  } catch (error) {
    console.error('Get daily report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving daily nutrition report'
    });
  }
};

const getWeeklyReport = async (req, res) => {
  try {
    const { userId } = req.user;
    const { endDate } = req.query;
    
    const end = endDate ? new Date(endDate) : new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 6);

    const meals = await MealHistory.find({
      userId,
      date: {
        $gte: start,
        $lte: end
      }
    });

    const dailyData = {};
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      dailyData[dateStr] = {
        date: dateStr,
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        sustainabilityScore: 0,
        mealCount: 0
      };
    }

    meals.forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      if (dailyData[dateStr]) {
        dailyData[dateStr].calories += meal.totalNutrition?.calories || 0;
        dailyData[dateStr].protein += meal.totalNutrition?.protein || 0;
        dailyData[dateStr].carbohydrates += meal.totalNutrition?.carbohydrates || 0;
        dailyData[dateStr].fat += meal.totalNutrition?.fat || 0;
        dailyData[dateStr].sustainabilityScore += meal.sustainability?.sustainabilityScore || 0;
        dailyData[dateStr].mealCount += 1;
      }
    });

    Object.keys(dailyData).forEach(date => {
      if (dailyData[date].mealCount > 0) {
        dailyData[date].sustainabilityScore = dailyData[date].sustainabilityScore / dailyData[date].mealCount;
      }
    });

    const weeklyTotals = Object.values(dailyData).reduce((acc, day) => {
      acc.calories += day.calories;
      acc.protein += day.protein;
      acc.carbohydrates += day.carbohydrates;
      acc.fat += day.fat;
      acc.sustainabilityScore += day.sustainabilityScore;
      return acc;
    }, { calories: 0, protein: 0, carbohydrates: 0, fat: 0, sustainabilityScore: 0 });

    res.json({
      success: true,
      data: {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        dailyBreakdown: Object.values(dailyData),
        weeklyTotals: {
          ...weeklyTotals,
          avgSustainabilityScore: weeklyTotals.sustainabilityScore / 7,
          avgDailyCalories: weeklyTotals.calories / 7
        }
      }
    });
  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving weekly nutrition report'
    });
  }
};

module.exports = {
  getDailyReport,
  getWeeklyReport
};
