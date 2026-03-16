const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 150
  },
  height: {
    type: Number,
    required: true,
    min: 50,
    max: 300
  },
  weight: {
    type: Number,
    required: true,
    min: 20,
    max: 500
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: true
  },
  activityLevel: {
    type: String,
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
    required: true
  },
  fitnessGoal: {
    type: String,
    enum: ['lose_weight', 'maintain', 'gain_muscle', 'improve_health'],
    required: true
  },
  foodAllergies: [{
    type: String
  }],
  healthConditions: [{
    type: String
  }],
  bmi: {
    type: Number,
    required: true
  },
  bmr: {
    type: Number,
    required: true
  },
  dailyCalorieTarget: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

userProfileSchema.methods.calculateBMI = function() {
  const heightInMeters = this.height / 100;
  this.bmi = this.weight / (heightInMeters * heightInMeters);
  return this.bmi;
};

userProfileSchema.methods.calculateBMR = function() {
  if (this.gender === 'male') {
    this.bmr = (10 * this.weight) + (6.25 * this.height) - (5 * this.age) + 5;
  } else {
    this.bmr = (10 * this.weight) + (6.25 * this.height) - (5 * this.age) - 161;
  }
  return this.bmr;
};

userProfileSchema.methods.calculateDailyCalorieTarget = function() {
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
  };
  
  const goalAdjustments = {
    lose_weight: -500,
    maintain: 0,
    gain_muscle: 300,
    improve_health: -200
  };
  
  const tdee = this.bmr * activityMultipliers[this.activityLevel];
  this.dailyCalorieTarget = Math.round(tdee + goalAdjustments[this.fitnessGoal]);
  return this.dailyCalorieTarget;
};

module.exports = mongoose.model('UserProfile', userProfileSchema);
