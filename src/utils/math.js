// BMI = kg/(m²)
export const calculateBMI = (weight, height) => {
  const heightM = height / 100;
  return weight / (heightM * heightM);
};

// BMR = Mifflin-St Jeor
export const calculateBMR = (weight, height, age, sex) => {
  if (sex === 'Female') {
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  return (10 * weight) + (6.25 * height) - (5 * age) + 5;
};

// Activity multipliers
const ACTIVITY_MULTIPLIERS = {
  'Sedentary': 1.2,
  'Lightly Active': 1.375,
  'Moderately Active': 1.55,
  'Very Active': 1.725,
  'Athlete': 1.9
};

// TDEE = BMR × activity multiplier
export const calculateTDEE = (bmr, activityLevel) => {
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.2));
};

// Calorie targets
export const calculateCalorieTarget = (tdee, goal) => {
  if (goal === 'Weight Loss') {
    return tdee - 500;
  }
  if (goal === 'Muscle Gain') {
    return tdee + 300;
  }
  return tdee;
};

// Protein target
export const calculateProteinTarget = (weight, goal) => {
  if (goal === 'Muscle Gain') {
    return Math.round(weight * 2.2);
  }
  return Math.round(weight * 1.6);
};

// BMI Category
export const getBMICategory = (bmi) => {
  if (bmi < 18.5) return { label: 'Underweight', color: '#f59e0b' };
  if (bmi < 25) return { label: 'Normal', color: '#4ade80' };
  if (bmi < 30) return { label: 'Overweight', color: '#f59e0b' };
  return { label: 'Obese', color: '#f87171' };
};

// Calculate all metrics
export const calculateAllMetrics = (profile) => {
  const { weight, height, age, sex, activityLevel, goal } = profile;
  
  const bmi = calculateBMI(weight, height);
  const bmr = Math.round(calculateBMR(weight, height, age, sex));
  const tdee = calculateTDEE(bmr, activityLevel);
  const calorieTarget = calculateCalorieTarget(tdee, goal);
  const proteinTarget = calculateProteinTarget(weight, goal);
  
  return {
    bmi: Math.round(bmi * 10) / 10,
    bmr,
    tdee,
    calorieTarget,
    proteinTarget,
    bmiCategory: getBMICategory(bmi)
  };
};
