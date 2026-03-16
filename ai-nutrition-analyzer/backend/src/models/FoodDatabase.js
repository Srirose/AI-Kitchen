const mongoose = require('mongoose');

const foodDatabaseSchema = new mongoose.Schema({
  fdcId: {
    type: String,
    unique: true,
    sparse: true
  },
  name: {
    type: String,
    required: true,
    index: true
  },
  category: {
    type: String,
    required: true
  },
  servingSize: {
    amount: { type: Number, default: 100 },
    unit: { type: String, default: 'g' }
  },
  nutritionPer100g: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbohydrates: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    fiber: { type: Number, default: 0 },
    sugar: { type: Number, default: 0 },
    sodium: { type: Number, default: 0 },
    cholesterol: { type: Number, default: 0 },
    saturatedFat: { type: Number, default: 0 },
    transFat: { type: Number, default: 0 },
    vitaminA: { type: Number, default: 0 },
    vitaminC: { type: Number, default: 0 },
    calcium: { type: Number, default: 0 },
    iron: { type: Number, default: 0 }
  },
  allergens: [{
    type: String
  }],
  dietaryTags: [{
    type: String,
    enum: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'high-protein']
  }],
  sustainabilityData: {
    carbonFootprint: { type: Number },
    waterUsage: { type: Number },
    landUse: { type: Number }
  },
  commonNames: [{
    type: String
  }],
  imageUrl: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

foodDatabaseSchema.index({ name: 'text', commonNames: 'text' });
foodDatabaseSchema.index({ category: 1 });

module.exports = mongoose.model('FoodDatabase', foodDatabaseSchema);
