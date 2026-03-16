/**
 * Dashboard Module
 * Handles dashboard functionality, data display, and interactions
 */

import {
  getCurrentUser,
  getUserProfile,
  saveUserProfile,
  getMealsByDate,
  saveMeal,
  deleteMeal,
  calculateDailyTotals,
  listenToMeals,
  uploadFoodImage,
  logoutUser
} from './firebase.js';

// ============================================
// DASHBOARD INITIALIZATION
// ============================================

/**
 * Initialize dashboard
 */
export async function initDashboard() {
  const user = getCurrentUser();
  
  if (!user) {
    window.location.href = 'login.html';
    return;
  }
  
  // Display user info
  displayUserInfo(user);
  
  // Load user profile
  await loadUserProfile(user.uid);
  
  // Load today's meals
  await loadTodayMeals(user.uid);
  
  // Set up realtime listener for meals
  const today = getTodayDateString();
  listenToMeals(user.uid, today, (meals) => {
    updateDashboardMetrics(meals);
  });
  
  // Initialize event listeners
  initEventListeners(user.uid);
}

/**
 * Display user information
 * @param {Object} user - Firebase user object
 */
function displayUserInfo(user) {
  const userNameEl = document.getElementById('user-name');
  const userEmailEl = document.getElementById('user-email');
  
  if (userNameEl) userNameEl.textContent = user.displayName || 'User';
  if (userEmailEl) userEmailEl.textContent = user.email;
}

// ============================================
// PROFILE MANAGEMENT
// ============================================

/**
 * Load and display user profile
 * @param {string} userId - User ID
 */
async function loadUserProfile(userId) {
  const result = await getUserProfile(userId);
  
  if (result.success && result.data) {
    const profile = result.data;
    
    // Display BMI and BMR
    displayMetric('bmi-value', profile.bmi, '--');
    displayMetric('bmr-value', profile.bmr, '--');
    displayMetric('bmr-unit', 'kcal/day', '');
    
    // Fill profile form if exists
    fillProfileForm(profile);
    
    // Store profile for calculations
    window.userProfile = profile;
  } else {
    // Show profile setup modal if no profile exists
    showProfileSetup();
  }
}

/**
 * Display metric value
 * @param {string} elementId - Element ID
 * @param {*} value - Value to display
 * @param {string} defaultValue - Default value if null
 */
function displayMetric(elementId, value, defaultValue) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = value !== undefined && value !== null ? value : defaultValue;
  }
}

/**
 * Fill profile form with existing data
 * @param {Object} profile - Profile data
 */
function fillProfileForm(profile) {
  const fields = ['name', 'age', 'height', 'weight', 'gender', 'activityLevel', 'allergies', 'diseases'];
  
  fields.forEach(field => {
    const input = document.getElementById(`profile-${field}`);
    if (input && profile[field] !== undefined) {
      input.value = profile[field];
    }
  });
}

/**
 * Show profile setup modal
 */
function showProfileSetup() {
  const modal = document.getElementById('profile-modal');
  if (modal) {
    modal.classList.remove('hidden');
  }
}

/**
 * Handle profile form submission
 * @param {string} userId - User ID
 */
export async function handleProfileSave(userId) {
  const profileData = {
    name: document.getElementById('profile-name')?.value || '',
    age: parseInt(document.getElementById('profile-age')?.value) || 0,
    height: parseFloat(document.getElementById('profile-height')?.value) || 0,
    weight: parseFloat(document.getElementById('profile-weight')?.value) || 0,
    gender: document.getElementById('profile-gender')?.value || 'male',
    activityLevel: document.getElementById('profile-activity')?.value || 'moderate',
    allergies: document.getElementById('profile-allergies')?.value || '',
    diseases: document.getElementById('profile-diseases')?.value || ''
  };
  
  const result = await saveUserProfile(userId, profileData);
  
  if (result.success) {
    // Update display
    displayMetric('bmi-value', result.data.bmi, '--');
    displayMetric('bmr-value', result.data.bmr, '--');
    
    // Store profile
    window.userProfile = result.data;
    
    // Hide modal
    const modal = document.getElementById('profile-modal');
    if (modal) modal.classList.add('hidden');
    
    showNotification('Profile saved successfully!', 'success');
  } else {
    showNotification('Failed to save profile: ' + result.error, 'error');
  }
}

// ============================================
// MEAL MANAGEMENT
// ============================================

/**
 * Load today's meals
 * @param {string} userId - User ID
 */
async function loadTodayMeals(userId) {
  const today = getTodayDateString();
  const result = await getMealsByDate(userId, today);
  
  if (result.success) {
    updateDashboardMetrics(result.data);
    renderMealsList(result.data);
  }
}

/**
 * Update dashboard metrics based on meals
 * @param {Object} meals - Meals data
 */
function updateDashboardMetrics(meals) {
  const totals = calculateDailyTotals(meals);
  
  // Update nutrition display
  displayMetric('today-calories', totals.calories, '0');
  displayMetric('today-protein', totals.protein, '0');
  displayMetric('today-carbs', totals.carbohydrates, '0');
  displayMetric('today-fat', totals.fat, '0');
  displayMetric('today-fiber', totals.fiber, '0');
  displayMetric('sustainability-score', totals.sustainabilityScore, '0');
  
  // Update progress bars
  updateProgressBar('calories-progress', totals.calories, window.userProfile?.dailyCalorieTarget || 2000);
  
  // Update sustainability rating
  updateSustainabilityRating(totals.sustainabilityScore);
}

/**
 * Update progress bar
 * @param {string} elementId - Progress bar element ID
 * @param {number} current - Current value
 * @param {number} target - Target value
 */
function updateProgressBar(elementId, current, target) {
  const progressBar = document.getElementById(elementId);
  if (progressBar) {
    const percentage = Math.min((current / target) * 100, 100);
    progressBar.style.width = `${percentage}%`;
    
    // Change color based on percentage
    progressBar.className = 'progress-bar';
    if (percentage > 100) {
      progressBar.classList.add('over-limit');
    } else if (percentage > 80) {
      progressBar.classList.add('near-limit');
    }
  }
}

/**
 * Update sustainability rating display
 * @param {number} score - Sustainability score
 */
function updateSustainabilityRating(score) {
  const ratingEl = document.getElementById('sustainability-rating');
  if (ratingEl) {
    let rating = 'F';
    let colorClass = 'rating-f';
    
    if (score >= 80) { rating = 'A'; colorClass = 'rating-a'; }
    else if (score >= 65) { rating = 'B'; colorClass = 'rating-b'; }
    else if (score >= 50) { rating = 'C'; colorClass = 'rating-c'; }
    else if (score >= 35) { rating = 'D'; colorClass = 'rating-d'; }
    else if (score >= 20) { rating = 'E'; colorClass = 'rating-e'; }
    
    ratingEl.textContent = rating;
    ratingEl.className = `rating-badge ${colorClass}`;
  }
}

/**
 * Render meals list
 * @param {Object} meals - Meals data
 */
function renderMealsList(meals) {
  const container = document.getElementById('meals-list');
  if (!container) return;
  
  container.innerHTML = '';
  
  if (!meals || Object.keys(meals).length === 0) {
    container.innerHTML = '<p class="empty-message">No meals logged today</p>';
    return;
  }
  
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
  
  mealTypes.forEach(type => {
    if (meals[type]) {
      const meal = meals[type];
      const mealCard = createMealCard(type, meal);
      container.appendChild(mealCard);
    }
  });
}

/**
 * Create meal card element
 * @param {string} type - Meal type
 * @param {Object} meal - Meal data
 * @returns {HTMLElement} - Meal card element
 */
function createMealCard(type, meal) {
  const card = document.createElement('div');
  card.className = 'meal-card';
  
  const typeLabel = type.charAt(0).toUpperCase() + type.slice(1);
  
  card.innerHTML = `
    <div class="meal-header">
      <h4>${typeLabel}</h4>
      <span class="meal-time">${formatTime(meal.timestamp)}</span>
    </div>
    <div class="meal-content">
      <p class="meal-items">${meal.items || meal.description || 'No details'}</p>
      <div class="meal-nutrition">
        <span class="calories">${meal.nutrition?.calories || 0} kcal</span>
        <span class="sustainability">Eco: ${meal.sustainabilityScore || 0}</span>
      </div>
    </div>
    <button class="delete-meal-btn" data-type="${type}">×</button>
  `;
  
  // Add delete handler
  const deleteBtn = card.querySelector('.delete-meal-btn');
  deleteBtn.addEventListener('click', () => handleDeleteMeal(type));
  
  return card;
}

/**
 * Handle adding a new meal
 * @param {string} userId - User ID
 */
export async function handleAddMeal(userId) {
  const mealType = document.getElementById('meal-type')?.value;
  const mealDescription = document.getElementById('meal-description')?.value;
  const calories = parseInt(document.getElementById('meal-calories')?.value) || 0;
  const protein = parseFloat(document.getElementById('meal-protein')?.value) || 0;
  const carbs = parseFloat(document.getElementById('meal-carbs')?.value) || 0;
  const fat = parseFloat(document.getElementById('meal-fat')?.value) || 0;
  const fiber = parseFloat(document.getElementById('meal-fiber')?.value) || 0;
  const sustainabilityScore = parseInt(document.getElementById('meal-sustainability')?.value) || 50;
  
  if (!mealType || !mealDescription) {
    showNotification('Please fill in meal type and description', 'error');
    return;
  }
  
  const mealData = {
    description: mealDescription,
    nutrition: {
      calories,
      protein,
      carbohydrates: carbs,
      fat,
      fiber
    },
    sustainabilityScore
  };
  
  const today = getTodayDateString();
  const result = await saveMeal(userId, today, mealType, mealData);
  
  if (result.success) {
    showNotification('Meal added successfully!', 'success');
    
    // Clear form
    document.getElementById('meal-form')?.reset();
    
    // Close modal
    const modal = document.getElementById('add-meal-modal');
    if (modal) modal.classList.add('hidden');
  } else {
    showNotification('Failed to add meal: ' + result.error, 'error');
  }
}

/**
 * Handle deleting a meal
 * @param {string} mealType - Meal type to delete
 */
async function handleDeleteMeal(mealType) {
  if (!confirm('Are you sure you want to delete this meal?')) return;
  
  const user = getCurrentUser();
  if (!user) return;
  
  const today = getTodayDateString();
  const result = await deleteMeal(user.uid, today, mealType);
  
  if (result.success) {
    showNotification('Meal deleted successfully!', 'success');
  } else {
    showNotification('Failed to delete meal', 'error');
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get today's date string in YYYY-MM-DD format
 * @returns {string} - Date string
 */
function getTodayDateString() {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

/**
 * Format timestamp to readable time
 * @param {string} timestamp - ISO timestamp
 * @returns {string} - Formatted time
 */
function formatTime(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Show notification
 * @param {string} message - Message to display
 * @param {string} type - 'success' or 'error'
 */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// EVENT LISTENERS
// ============================================

/**
 * Initialize event listeners
 * @param {string} userId - User ID
 */
function initEventListeners(userId) {
  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await logoutUser();
      window.location.href = 'login.html';
    });
  }
  
  // Add meal button
  const addMealBtn = document.getElementById('add-meal-btn');
  if (addMealBtn) {
    addMealBtn.addEventListener('click', () => {
      const modal = document.getElementById('add-meal-modal');
      if (modal) modal.classList.remove('hidden');
    });
  }
  
  // Save meal button
  const saveMealBtn = document.getElementById('save-meal-btn');
  if (saveMealBtn) {
    saveMealBtn.addEventListener('click', () => handleAddMeal(userId));
  }
  
  // Save profile button
  const saveProfileBtn = document.getElementById('save-profile-btn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => handleProfileSave(userId));
  }
  
  // Close modals
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) modal.classList.add('hidden');
    });
  });
  
  // Tab navigation
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.target.dataset.tab;
      
      // Remove active class from all tabs
      document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
      
      // Add active class to clicked tab
      e.target.classList.add('active');
      document.getElementById(tabId)?.classList.remove('hidden');
    });
  });
}
