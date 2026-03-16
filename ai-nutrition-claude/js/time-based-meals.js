/**
 * Time-Based Meal Flow Module
 * Adapts meal suggestions based on time of day and previous meals eaten
 */

import { store } from './store.js';

// Time periods and their corresponding meal focuses
const TIME_PERIODS = {
  morning: { start: 5, end: 11, focus: 'breakfast', askAbout: [] },
  afternoon: { start: 11, end: 15, focus: 'lunch', askAbout: ['breakfast'] },
  evening: { start: 15, end: 19, focus: 'snack', askAbout: ['breakfast', 'lunch'] },
  night: { start: 19, end: 23, focus: 'dinner', askAbout: ['breakfast', 'lunch', 'snack'] }
};

/**
 * Get current time period
 * @returns {string} - Current period (morning/afternoon/evening/night)
 */
export function getCurrentTimePeriod() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 11) return 'morning';
  if (hour >= 11 && hour < 15) return 'afternoon';
  if (hour >= 15 && hour < 19) return 'evening';
  return 'night';
}

/**
 * Get time period display name
 * @param {string} period - Time period
 * @returns {string} - Display name
 */
export function getTimePeriodDisplay(period) {
  const displays = {
    morning: '🌅 Good Morning',
    afternoon: '☀️ Good Afternoon',
    evening: '🌆 Good Evening',
    night: '🌙 Good Night'
  };
  return displays[period] || 'Hello';
}

/**
 * Get current meal focus based on time
 * @returns {Object} - Current meal configuration
 */
export function getCurrentMealFocus() {
  const period = getCurrentTimePeriod();
  const config = TIME_PERIODS[period];
  
  return {
    period,
    primaryMeal: config.focus,
    askAboutMeals: config.askAbout,
    greeting: getTimePeriodDisplay(period)
  };
}

/**
 * Check which meals have been logged today
 * @returns {Object} - Meals and their status
 */
export function getTodaysMealStatus() {
  const today = store.getState().currentDate;
  const meals = store.getMeals(today);
  
  return {
    breakfast: !!meals.breakfast,
    lunch: !!meals.lunch,
    dinner: !!meals.dinner,
    snack: !!meals.snack,
    dessert: !!meals.dessert,
    meals: meals
  };
}

/**
 * Calculate remaining nutrition for the day
 * @returns {Object} - Remaining calories and macros
 */
export function getRemainingNutrition() {
  const profile = store.getProfile();
  const todayMeals = getTodaysMealStatus();
  const targets = profile?.targets || {};
  
  const targetCalories = targets.calorieTarget || 2000;
  const targetMacros = targets.macros || { protein: 150, carbs: 250, fat: 65 };
  
  // Calculate consumed
  let consumedCalories = 0;
  let consumedProtein = 0;
  let consumedCarbs = 0;
  let consumedFat = 0;
  
  Object.values(todayMeals.meals).forEach(meal => {
    const ingredientCount = meal.ingredients?.length || 0;
    consumedCalories += ingredientCount * 120;
    consumedProtein += ingredientCount * 8;
    consumedCarbs += ingredientCount * 12;
    consumedFat += ingredientCount * 5;
  });
  
  return {
    calories: Math.max(0, targetCalories - consumedCalories),
    protein: Math.max(0, targetMacros.protein - consumedProtein),
    carbs: Math.max(0, targetMacros.carbs - consumedCarbs),
    fat: Math.max(0, targetMacros.fat - consumedFat),
    consumed: {
      calories: consumedCalories,
      protein: consumedProtein,
      carbs: consumedCarbs,
      fat: consumedFat
    },
    targets: {
      calories: targetCalories,
      protein: targetMacros.protein,
      carbs: targetMacros.carbs,
      fat: targetMacros.fat
    }
  };
}

/**
 * Generate contextual message based on time and meal history
 * @returns {Object} - Contextual message and suggestions
 */
export function getContextualMealPrompt() {
  const focus = getCurrentMealFocus();
  const mealStatus = getTodaysMealStatus();
  const remaining = getRemainingNutrition();
  
  let message = '';
  let missedMeals = [];
  let suggestions = [];
  
  // Check which meals from "askAbout" were missed
  focus.askAboutMeals.forEach(mealType => {
    if (!mealStatus[mealType]) {
      missedMeals.push(mealType);
    }
  });
  
  // Build contextual message
  switch (focus.period) {
    case 'morning':
      message = `${focus.greeting}! Let's start your day with a healthy breakfast.`;
      suggestions = [
        'High protein breakfast ideas',
        'Quick and easy morning meals',
        'Energy boosting breakfast'
      ];
      break;
      
    case 'afternoon':
      if (missedMeals.includes('breakfast')) {
        message = `${focus.greeting}! I notice you haven't logged breakfast. Did you skip it or would you like to add it now?`;
        suggestions = [
          'Add breakfast now',
          'Light lunch ideas',
          'Make up for missed calories'
        ];
      } else {
        const breakfast = mealStatus.meals.breakfast;
        const breakfastCalories = (breakfast?.ingredients?.length || 0) * 120;
        message = `${focus.greeting}! You had about ${breakfastCalories} calories for breakfast. Let's plan a balanced lunch.`;
        suggestions = [
          'Balanced lunch recipes',
          'Protein-rich lunch',
          'Light lunch options'
        ];
      }
      break;
      
    case 'evening':
      const breakfastEaten = mealStatus.breakfast;
      const lunchEaten = mealStatus.lunch;
      
      if (!breakfastEaten && !lunchEaten) {
        message = `${focus.greeting}! You've had a busy day. Would you like a healthy snack to keep you going?`;
      } else if (!breakfastEaten) {
        message = `${focus.greeting}! You had lunch but missed breakfast. How about a nutritious snack to balance your day?`;
      } else if (!lunchEaten) {
        message = `${focus.greeting}! You had breakfast but missed lunch. Let's have a substantial snack to keep your energy up.`;
      } else {
        const totalSoFar = remaining.consumed.calories;
        message = `${focus.greeting}! You've consumed about ${totalSoFar} calories today. Here's a snack suggestion to keep you satisfied until dinner.`;
      }
      suggestions = [
        'Healthy snack ideas',
        'Protein snacks',
        'Low calorie snacks'
      ];
      break;
      
    case 'night':
      const mealsEaten = [];
      if (mealStatus.breakfast) mealsEaten.push('breakfast');
      if (mealStatus.lunch) mealsEaten.push('lunch');
      if (mealStatus.snack) mealsEaten.push('snack');
      
      const mealsMissed = [];
      if (!mealStatus.breakfast) mealsMissed.push('breakfast');
      if (!mealStatus.lunch) mealsMissed.push('lunch');
      if (!mealStatus.snack) mealsMissed.push('snack');
      
      if (mealsEaten.length === 0) {
        message = `${focus.greeting}! It looks like you haven't logged any meals today. Let's make dinner count!`;
      } else if (mealsMissed.length > 0) {
        message = `${focus.greeting}! You've had ${mealsEaten.join(', ')}. You missed ${mealsMissed.join(' and ')}. Let's plan a nutritious dinner to round out your day.`;
      } else {
        message = `${focus.greeting}! Great job tracking all your meals today. You've consumed ${remaining.consumed.calories} calories. Here's a dinner suggestion that fits your remaining ${remaining.calories} calories.`;
      }
      suggestions = [
        'Balanced dinner recipes',
        'High protein dinner',
        'Light dinner options'
      ];
      break;
  }
  
  return {
    greeting: focus.greeting,
    period: focus.period,
    primaryMeal: focus.primaryMeal,
    message,
    missedMeals,
    suggestions,
    remainingNutrition: remaining,
    mealStatus
  };
}

/**
 * Get meal slots to display based on time of day
 * @returns {Array} - Array of meal slot configurations
 */
export function getMealSlotsForCurrentTime() {
  const focus = getCurrentMealFocus();
  const mealStatus = getTodaysMealStatus();
  
  const slotConfigs = {
    breakfast: { icon: '🌅', color: '#fef3c7', title: 'Breakfast' },
    lunch: { icon: '☀️', color: '#dbeafe', title: 'Lunch' },
    dinner: { icon: '🌙', color: '#e0e7ff', title: 'Dinner' },
    snack: { icon: '🥜', color: '#fce7f3', title: 'Snack' },
    dessert: { icon: '🍰', color: '#f3e8ff', title: 'Dessert' }
  };
  
  // Always show the primary meal for current time
  const slots = [{
    id: focus.primaryMeal,
    ...slotConfigs[focus.primaryMeal],
    isPrimary: true,
    prompt: getMealPrompt(focus.primaryMeal, mealStatus)
  }];
  
  // For afternoon/evening/night, also show missed meals
  if (focus.period !== 'morning') {
    focus.askAboutMeals.forEach(mealType => {
      if (!mealStatus[mealType]) {
        slots.push({
          id: mealType,
          ...slotConfigs[mealType],
          isPrimary: false,
          isMissed: true,
          prompt: `Did you eat ${mealType}? Add it now:`
        });
      }
    });
  }
  
  return slots;
}

function getMealPrompt(mealType, mealStatus) {
  const prompts = {
    breakfast: "What are you having for breakfast?",
    lunch: mealStatus.breakfast 
      ? "Now let's plan your lunch based on your breakfast:"
      : "What would you like for lunch?",
    snack: "Time for a snack! What are you having?",
    dinner: "Let's plan your dinner to complete your daily nutrition:"
  };
  return prompts[mealType] || `Add your ${mealType}:`;
}

/**
 * Generate AI prompt for recipe suggestions based on context
 * @returns {string} - AI prompt
 */
export function generateContextualRecipePrompt() {
  const context = getContextualMealPrompt();
  const focus = getCurrentMealFocus();
  const profile = store.getProfile();
  
  let prompt = `I need ${focus.primaryMeal} recipe suggestions. `;
  
  // Add context about previous meals
  if (context.missedMeals.length > 0) {
    prompt += `I missed ${context.missedMeals.join(' and ')} today. `;
  }
  
  // Add nutrition context
  prompt += `I've consumed ${context.remainingNutrition.consumed.calories} calories so far. `;
  prompt += `I have ${context.remainingNutrition.calories} calories remaining for today. `;
  
  // Add macro context
  prompt += `My remaining macros: ${Math.round(context.remainingNutrition.protein)}g protein, `;
  prompt += `${Math.round(context.remainingNutrition.carbs)}g carbs, `;
  prompt += `${Math.round(context.remainingNutrition.fat)}g fat. `;
  
  // Add profile preferences
  if (profile) {
    if (profile.dietPreference && profile.dietPreference !== 'none') {
      prompt += `I prefer ${profile.dietPreference} meals. `;
    }
    if (profile.allergies) {
      prompt += `Avoid: ${profile.allergies}. `;
    }
    if (profile.healthConditions) {
      prompt += `Consider: ${profile.healthConditions}. `;
    }
  }
  
  prompt += `Please suggest 2-3 ${focus.primaryMeal} recipes that fit my remaining nutrition targets. `;
  prompt += `Use RECIPE_1, RECIPE_2, NUTRIENTS, and SUSTAINABILITY tags.`;
  
  return prompt;
}
