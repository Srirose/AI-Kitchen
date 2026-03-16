/**
 * Firebase Configuration and Services
 * AI-Powered Sustainable Nutrition Analyzer
 */

// Firebase SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import {
  getDatabase,
  ref,
  set,
  get,
  update,
  remove,
  push,
  child,
  onValue,
  query,
  orderByChild,
  equalTo
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjHA4lXKyLSLzEKdDOuizTi4q3WuTdDBg",
  authDomain: "ai-nutrition-e1a1b.firebaseapp.com",
  databaseURL: "https://ai-nutrition-e1a1b-default-rtdb.firebaseio.com",
  projectId: "ai-nutrition-e1a1b",
  storageBucket: "ai-nutrition-e1a1b.firebasestorage.app",
  messagingSenderId: "864475379432",
  appId: "1:864475379432:web:6e6acb75e2fcbcba463b5d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const database = getDatabase(app);
const storage = getStorage(app);

// ============================================
// AUTHENTICATION FUNCTIONS
// ============================================

/**
 * Register a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} displayName - User's display name
 * @returns {Promise<Object>} - User credential object
 */
export async function registerUser(email, password, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    await updateProfile(userCredential.user, {
      displayName: displayName
    });
    
    // Create initial user profile in database
    await createUserProfile(userCredential.user.uid, {
      name: displayName,
      email: email,
      createdAt: new Date().toISOString()
    });
    
    return {
      success: true,
      user: userCredential.user,
      message: 'User registered successfully'
    };
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Login existing user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User credential object
 */
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}

/**
 * Logout current user
 * @returns {Promise<Object>} - Logout result
 */
export async function logoutUser() {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Logout successful'
    };
  } catch (error) {
    console.error('Logout error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current authenticated user
 * @returns {Object|null} - Current user or null
 */
export function getCurrentUser() {
  return auth.currentUser;
}

/**
 * Listen to authentication state changes
 * @param {Function} callback - Callback function(user)
 * @returns {Function} - Unsubscribe function
 */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// ============================================
// USER PROFILE FUNCTIONS
// ============================================

/**
 * Create initial user profile in database
 * @param {string} userId - User ID
 * @param {Object} profileData - Initial profile data
 */
async function createUserProfile(userId, profileData) {
  const userRef = ref(database, `users/${userId}/profile`);
  await set(userRef, profileData);
}

/**
 * Save or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data to save
 * @returns {Promise<Object>} - Result object
 */
export async function saveUserProfile(userId, profileData) {
  try {
    // Calculate BMI and BMR
    const bmi = calculateBMI(profileData.weight, profileData.height);
    const bmr = calculateBMR(profileData.weight, profileData.height, profileData.age, profileData.gender);
    
    const profileWithCalculations = {
      ...profileData,
      bmi: bmi,
      bmr: bmr,
      updatedAt: new Date().toISOString()
    };
    
    const userRef = ref(database, `users/${userId}/profile`);
    await update(userRef, profileWithCalculations);
    
    return {
      success: true,
      message: 'Profile saved successfully',
      data: profileWithCalculations
    };
  } catch (error) {
    console.error('Save profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get user profile from database
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Profile data
 */
export async function getUserProfile(userId) {
  try {
    const profileRef = ref(database, `users/${userId}/profile`);
    const snapshot = await get(profileRef);
    
    if (snapshot.exists()) {
      return {
        success: true,
        data: snapshot.val()
      };
    } else {
      return {
        success: false,
        error: 'Profile not found'
      };
    }
  } catch (error) {
    console.error('Get profile error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// CALCULATION HELPERS
// ============================================

/**
 * Calculate BMI (Body Mass Index)
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} - BMI value
 */
function calculateBMI(weight, height) {
  const heightInMeters = height / 100;
  return parseFloat((weight / (heightInMeters * heightInMeters)).toFixed(2));
}

/**
 * Calculate BMR (Basal Metabolic Rate) using Mifflin-St Jeor equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - 'male' or 'female'
 * @returns {number} - BMR value
 */
function calculateBMR(weight, height, age, gender) {
  let bmr;
  if (gender === 'male') {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
  } else {
    bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
  }
  return Math.round(bmr);
}

// ============================================
// MEAL LOG FUNCTIONS
// ============================================

/**
 * Save a meal entry for a specific date
 * @param {string} userId - User ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} mealType - 'breakfast', 'lunch', 'dinner', or 'snacks'
 * @param {Object} mealData - Meal data object
 * @returns {Promise<Object>} - Result object
 */
export async function saveMeal(userId, date, mealType, mealData) {
  try {
    const mealRef = ref(database, `users/${userId}/meals/${date}/${mealType}`);
    
    const mealWithTimestamp = {
      ...mealData,
      timestamp: new Date().toISOString(),
      mealType: mealType
    };
    
    await set(mealRef, mealWithTimestamp);
    
    return {
      success: true,
      message: 'Meal saved successfully'
    };
  } catch (error) {
    console.error('Save meal error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get meals for a specific date
 * @param {string} userId - User ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Promise<Object>} - Meals data
 */
export async function getMealsByDate(userId, date) {
  try {
    const mealsRef = ref(database, `users/${userId}/meals/${date}`);
    const snapshot = await get(mealsRef);
    
    if (snapshot.exists()) {
      return {
        success: true,
        data: snapshot.val()
      };
    } else {
      return {
        success: true,
        data: {}
      };
    }
  } catch (error) {
    console.error('Get meals error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get meals for a date range
 * @param {string} userId - User ID
 * @param {string} startDate - Start date (YYYY-MM-DD)
 * @param {string} endDate - End date (YYYY-MM-DD)
 * @returns {Promise<Object>} - Meals data for date range
 */
export async function getMealsByDateRange(userId, startDate, endDate) {
  try {
    const mealsRef = ref(database, `users/${userId}/meals`);
    const snapshot = await get(mealsRef);
    
    if (snapshot.exists()) {
      const allMeals = snapshot.val();
      const filteredMeals = {};
      
      Object.keys(allMeals).forEach(date => {
        if (date >= startDate && date <= endDate) {
          filteredMeals[date] = allMeals[date];
        }
      });
      
      return {
        success: true,
        data: filteredMeals
      };
    } else {
      return {
        success: true,
        data: {}
      };
    }
  } catch (error) {
    console.error('Get meals range error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete a specific meal
 * @param {string} userId - User ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {string} mealType - Meal type to delete
 * @returns {Promise<Object>} - Result object
 */
export async function deleteMeal(userId, date, mealType) {
  try {
    const mealRef = ref(database, `users/${userId}/meals/${date}/${mealType}`);
    await remove(mealRef);
    
    return {
      success: true,
      message: 'Meal deleted successfully'
    };
  } catch (error) {
    console.error('Delete meal error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Calculate daily nutrition totals
 * @param {Object} dayMeals - Meals for a specific day
 * @returns {Object} - Nutrition totals
 */
export function calculateDailyTotals(dayMeals) {
  const totals = {
    calories: 0,
    protein: 0,
    carbohydrates: 0,
    fat: 0,
    fiber: 0,
    sustainabilityScore: 0,
    mealCount: 0
  };
  
  if (!dayMeals) return totals;
  
  Object.values(dayMeals).forEach(meal => {
    if (meal.nutrition) {
      totals.calories += meal.nutrition.calories || 0;
      totals.protein += meal.nutrition.protein || 0;
      totals.carbohydrates += meal.nutrition.carbohydrates || 0;
      totals.fat += meal.nutrition.fat || 0;
      totals.fiber += meal.nutrition.fiber || 0;
    }
    if (meal.sustainabilityScore) {
      totals.sustainabilityScore += meal.sustainabilityScore;
    }
    totals.mealCount++;
  });
  
  // Average sustainability score
  if (totals.mealCount > 0) {
    totals.sustainabilityScore = Math.round(totals.sustainabilityScore / totals.mealCount);
  }
  
  return totals;
}

// ============================================
// STORAGE FUNCTIONS
// ============================================

/**
 * Upload food image to Firebase Storage
 * @param {string} userId - User ID
 * @param {File} file - Image file
 * @param {string} mealType - Type of meal
 * @returns {Promise<Object>} - Download URL
 */
export async function uploadFoodImage(userId, file, mealType) {
  try {
    const timestamp = Date.now();
    const fileName = `${mealType}_${timestamp}_${file.name}`;
    const imageRef = storageRef(storage, `users/${userId}/food-images/${fileName}`);
    
    await uploadBytes(imageRef, file);
    const downloadURL = await getDownloadURL(imageRef);
    
    return {
      success: true,
      url: downloadURL,
      path: imageRef.fullPath
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Delete food image from storage
 * @param {string} imagePath - Full path to image
 * @returns {Promise<Object>} - Result object
 */
export async function deleteFoodImage(imagePath) {
  try {
    const imageRef = storageRef(storage, imagePath);
    await deleteObject(imageRef);
    
    return {
      success: true,
      message: 'Image deleted successfully'
    };
  } catch (error) {
    console.error('Delete image error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// ============================================
// REALTIME LISTENERS
// ============================================

/**
 * Listen to user's profile changes in realtime
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function(data)
 * @returns {Function} - Unsubscribe function
 */
export function listenToProfile(userId, callback) {
  const profileRef = ref(database, `users/${userId}/profile`);
  return onValue(profileRef, (snapshot) => {
    callback(snapshot.val());
  });
}

/**
 * Listen to today's meals in realtime
 * @param {string} userId - User ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @param {Function} callback - Callback function(data)
 * @returns {Function} - Unsubscribe function
 */
export function listenToMeals(userId, date, callback) {
  const mealsRef = ref(database, `users/${userId}/meals/${date}`);
  return onValue(mealsRef, (snapshot) => {
    callback(snapshot.val());
  });
}

// Export Firebase instances
export { auth, database, storage };
