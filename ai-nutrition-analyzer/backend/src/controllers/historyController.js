const { MealHistory } = require('../models');

const getMealHistory = async (req, res) => {
  try {
    const { userId } = req.user;
    const { page = 1, limit = 20, startDate, endDate, mealType } = req.query;

    const query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (mealType) {
      query.mealType = mealType;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const meals = await MealHistory.find(query)
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await MealHistory.countDocuments(query);

    res.json({
      success: true,
      data: {
        meals: meals.map(meal => ({
          id: meal._id,
          mealType: meal.mealType,
          date: meal.date,
          inputMethod: meal.inputMethod,
          foodItems: meal.foodItems,
          totalNutrition: meal.totalNutrition,
          sustainability: meal.sustainability,
          notes: meal.notes,
          imageUrl: meal.imageUrl
        })),
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get meal history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving meal history'
    });
  }
};

const getMealById = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const meal = await MealHistory.findOne({ _id: id, userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      data: {
        meal: {
          id: meal._id,
          mealType: meal.mealType,
          date: meal.date,
          inputMethod: meal.inputMethod,
          foodItems: meal.foodItems,
          totalNutrition: meal.totalNutrition,
          sustainability: meal.sustainability,
          notes: meal.notes,
          imageUrl: meal.imageUrl,
          createdAt: meal.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get meal by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving meal'
    });
  }
};

const deleteMeal = async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const meal = await MealHistory.findOneAndDelete({ _id: id, userId });

    if (!meal) {
      return res.status(404).json({
        success: false,
        message: 'Meal not found'
      });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting meal'
    });
  }
};

const getCalendarView = async (req, res) => {
  try {
    const { userId } = req.user;
    const { year, month } = req.query;

    const targetYear = parseInt(year) || new Date().getFullYear();
    const targetMonth = parseInt(month) || new Date().getMonth() + 1;

    const startDate = new Date(targetYear, targetMonth - 1, 1);
    const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const meals = await MealHistory.find({
      userId,
      date: {
        $gte: startDate,
        $lte: endDate
      }
    }).sort({ date: 1 });

    const calendarData = {};

    meals.forEach(meal => {
      const dateStr = meal.date.toISOString().split('T')[0];
      
      if (!calendarData[dateStr]) {
        calendarData[dateStr] = {
          date: dateStr,
          meals: [],
          totalCalories: 0,
          avgSustainabilityScore: 0,
          mealCount: 0
        };
      }

      calendarData[dateStr].meals.push({
        id: meal._id,
        mealType: meal.mealType,
        calories: meal.totalNutrition?.calories || 0,
        sustainabilityScore: meal.sustainability?.sustainabilityScore || 0
      });

      calendarData[dateStr].totalCalories += meal.totalNutrition?.calories || 0;
      calendarData[dateStr].avgSustainabilityScore += meal.sustainability?.sustainabilityScore || 0;
      calendarData[dateStr].mealCount += 1;
    });

    Object.keys(calendarData).forEach(date => {
      if (calendarData[date].mealCount > 0) {
        calendarData[date].avgSustainabilityScore = 
          calendarData[date].avgSustainabilityScore / calendarData[date].mealCount;
      }
    });

    res.json({
      success: true,
      data: {
        year: targetYear,
        month: targetMonth,
        days: Object.values(calendarData)
      }
    });
  } catch (error) {
    console.error('Get calendar view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving calendar view'
    });
  }
};

module.exports = {
  getMealHistory,
  getMealById,
  deleteMeal,
  getCalendarView
};
