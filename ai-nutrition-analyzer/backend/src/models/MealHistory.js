const mongoose = require('mongoose');

const nutritionSchema = new mongoose.Schema({
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbohydrates: { type: Number, default: 0 },
  fat: { type: Number, default: 0 },
  fiber: { type: Number, default: 0 },
  sugar: { type: Number, default: 0 },
  sodium: { type: Number, default: 0 }
});

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  unit: { type: String, default: 'serving' },
  confidence: { type: Number, min: 0, max: 1 },
  nutrition: nutritionSchema
});

const sustainabilitySchema = new mongoose.Schema({
  carbonFootprint: { type: Number, default: 0 },
  waterUsage: { type: Number, default: 0 },
  landUse: { type: Number, default: 0 },
  sustainabilityScore: { type: Number, min: 0, max: 100 },
  rating: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F'] }
});

const mealHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  inputMethod: {
    type: String,
    enum: ['image', 'voice', 'text'],
    required: true
  },
  foodItems: [foodItemSchema],
  totalNutrition: nutritionSchema,
  sustainability: sustainabilitySchema,
  imageUrl: {
    type: String
  },
  notes: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

mealHistorySchema.pre('save', function(next) {
  this.totalNutrition = this.foodItems.reduce((acc, item) => {
    acc.calories += item.nutrition.calories || 0;
    acc.protein += item.nutrition.protein || 0;
    acc.carbohydrates += item.nutrition.carbohydrates || 0;
    acc.fat += item.nutrition.fat || 0;
    acc.fiber += item.nutrition.fiber || 0;
    acc.sugar += item.nutrition.sugar || 0;
    acc.sodium += item.nutrition.sodium || 0;
    return acc;
  }, {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  });
  next();
});

mealHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('MealHistory', mealHistorySchema);
