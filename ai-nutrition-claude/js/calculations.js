/**
 * Health Calculations Module
 * BMI, BMR, TDEE, and Calorie Target Calculations
 */

// Activity Level Multipliers
const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,      // Little/no exercise
  light: 1.375,        // 1-3 days/week
  moderate: 1.55,      // 3-5 days/week
  active: 1.725,       // 6-7 days/week
  very_active: 1.9     // Physical job/training
};

// Goal-based calorie adjustments
const GOAL_ADJUSTMENTS = {
  lose_weight: -500,    // 500 cal deficit
  maintain: 0,          // No change
  gain_weight: 500,     // 500 cal surplus
  build_muscle: 300     // Moderate surplus
};

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {Object} - BMI value and category
 */
export function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);
  const roundedBMI = Math.round(bmi * 10) / 10;
  
  let category, color;
  if (bmi < 18.5) {
    category = 'Underweight';
    color = '#f59e0b';
  } else if (bmi < 25) {
    category = 'Normal';
    color = '#10b981';
  } else if (bmi < 30) {
    category = 'Overweight';
    color = '#f97316';
  } else {
    category = 'Obese';
    color = '#ef4444';
  }
  
  return {
    value: roundedBMI,
    category,
    color,
    healthy: bmi >= 18.5 && bmi < 25
  };
}

/**
 * Calculate BMR using Mifflin-St Jeor Equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} sex - 'male' or 'female'
 * @returns {number} - BMR in calories/day
 */
export function calculateBMR(weight, height, age, sex) {
  let bmr;
  if (sex === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  return Math.round(bmr);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure)
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level key
 * @returns {number} - TDEE in calories/day
 */
export function calculateTDEE(bmr, activityLevel) {
  const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || 1.2;
  return Math.round(bmr * multiplier);
}

/**
 * Calculate daily calorie target based on goal
 * @param {number} tdee - Total Daily Energy Expenditure
 * @param {string} goal - Fitness goal
 * @returns {number} - Target calories
 */
export function calculateCalorieTarget(tdee, goal) {
  const adjustment = GOAL_ADJUSTMENTS[goal] || 0;
  return Math.max(1200, tdee + adjustment); // Minimum 1200 calories
}

/**
 * Calculate all metrics at once
 * @param {Object} profile - User profile data
 * @returns {Object} - All calculated metrics
 */
export function calculateAllMetrics(profile) {
  const { weight, height, age, sex, activityLevel, goal } = profile;
  
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR(weight, height, age, sex);
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, goal);
  
  // Calculate macro targets (default distribution)
  const protein = Math.round(weight * 2); // 2g per kg bodyweight
  const fat = Math.round(calorieTarget * 0.25 / 9); // 25% of calories
  const carbs = Math.round((calorieTarget - (protein * 4) - (fat * 9)) / 4);
  const fiber = Math.round(calorieTarget / 1000 * 14); // 14g per 1000 cal
  
  return {
    bmi,
    bmr,
    tdee,
    calorieTarget,
    macros: {
      protein,
      carbs,
      fat,
      fiber
    }
  };
}

/**
 * Get BMI category description
 * @param {number} bmi - BMI value
 * @returns {string} - Description
 */
export function getBMIDescription(bmi) {
  if (bmi < 18.5) return 'Consider gaining weight for optimal health';
  if (bmi < 25) return 'You are in a healthy weight range';
  if (bmi < 30) return 'Consider losing weight for optimal health';
  return 'Weight loss recommended for health benefits';
}

/**
 * Get activity level description
 * @param {string} level - Activity level key
 * @returns {string} - Human readable description
 */
export function getActivityDescription(level) {
  const descriptions = {
    sedentary: 'Little or no exercise',
    light: 'Light exercise 1-3 days/week',
    moderate: 'Moderate exercise 3-5 days/week',
    active: 'Hard exercise 6-7 days/week',
    very_active: 'Very hard exercise/physical job'
  };
  return descriptions[level] || 'Unknown';
}
