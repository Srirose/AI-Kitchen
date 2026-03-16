/**
 * Main Application Controller
 * Handles navigation, state management, and UI updates
 */

import { store } from './store.js';
import { calculateAllMetrics, getActivityDescription } from './calculations.js';
import { voiceInput, parseVoiceIngredients } from './voice-input.js';
import { sendToClaude, analyzeIngredients, analyzeDailyMeals } from './claude-api.js';
import { createRingChart, createBarChart, createSustainabilityGauge, createWeeklyChart } from './charts.js';
import { 
  getCurrentTimePeriod, 
  getContextualMealPrompt, 
  getMealSlotsForCurrentTime,
  getRemainingNutrition,
  generateContextualRecipePrompt 
} from './time-based-meals.js';

// ============================================
// NAVIGATION
// ============================================

const screens = {
  login: document.getElementById('login-screen'),
  profile: document.getElementById('profile-screen'),
  mealPlanner: document.getElementById('meal-planner-screen'),
  analysis: document.getElementById('analysis-screen')
};

export function navigateTo(screenName) {
  // Hide all screens
  Object.values(screens).forEach(screen => {
    if (screen) screen.classList.add('hidden');
  });
  
  // Show target screen
  if (screens[screenName]) {
    screens[screenName].classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  
  // Initialize screen-specific logic
  switch(screenName) {
    case 'profile':
      initProfileScreen();
      break;
    case 'mealPlanner':
      initMealPlannerScreen();
      break;
    case 'analysis':
      initAnalysisScreen();
      break;
  }
}

// ============================================
// LOGIN SCREEN
// ============================================

export function initLoginScreen() {
  const loginForm = document.getElementById('login-form');
  const demoBtn = document.getElementById('demo-btn');
  
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('login-name').value;
      const email = document.getElementById('login-email').value;
      
      // Create user session
      store.setUser({ name, email, id: Date.now().toString() });
      
      // Navigate to profile setup
      navigateTo('profile');
    });
  }
  
  if (demoBtn) {
    demoBtn.addEventListener('click', () => {
      store.setUser({ name: 'Demo User', email: 'demo@example.com', id: 'demo' });
      navigateTo('profile');
    });
  }
}

// ============================================
// PROFILE SETUP SCREEN
// ============================================

function initProfileScreen() {
  const form = document.getElementById('profile-form');
  const inputs = form.querySelectorAll('input, select');
  
  // Check if editing existing profile
  const existingProfile = store.getProfile();
  if (existingProfile) {
    populateProfileForm(existingProfile);
    document.querySelector('.screen-header h2').textContent = 'Edit Your Profile';
    document.querySelector('.screen-header p').textContent = 'Update your health information';
  }
  
  // Live calculation updates
  inputs.forEach(input => {
    input.addEventListener('input', updateLiveCalculations);
  });
  
  // Form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveProfile();
  });
  
  // Initial calculation
  updateLiveCalculations();
}

function populateProfileForm(profile) {
  const fields = ['name', 'phone', 'email', 'age', 'height', 'weight', 'sex', 'goal', 'activityLevel', 'dietPreference', 'healthConditions', 'allergies'];
  
  fields.forEach(field => {
    const input = document.getElementById(field === 'activityLevel' ? 'activity-level' : 
                                          field === 'dietPreference' ? 'diet-preference' : 
                                          field === 'healthConditions' ? 'health-conditions' : field);
    if (input && profile[field] !== undefined) {
      input.value = profile[field];
    }
  });
}

function updateLiveCalculations() {
  const weight = parseFloat(document.getElementById('weight').value) || 0;
  const height = parseFloat(document.getElementById('height').value) || 0;
  const age = parseInt(document.getElementById('age').value) || 0;
  const sex = document.getElementById('sex').value;
  const activityLevel = document.getElementById('activity-level').value;
  const goal = document.getElementById('goal').value;
  
  if (weight > 0 && height > 0 && age > 0) {
    const metrics = calculateAllMetrics({ weight, height, age, sex, activityLevel, goal });
    
    // Update BMI display
    const bmiValue = document.getElementById('bmi-value');
    const bmiCategory = document.getElementById('bmi-category');
    if (bmiValue) {
      bmiValue.textContent = metrics.bmi.value;
      bmiValue.style.color = metrics.bmi.color;
    }
    if (bmiCategory) {
      bmiCategory.textContent = metrics.bmi.category;
      bmiCategory.style.backgroundColor = metrics.bmi.color + '20';
      bmiCategory.style.color = metrics.bmi.color;
    }
    
    // Update BMR display
    const bmrValue = document.getElementById('bmr-value');
    const tdeeValue = document.getElementById('tdee-value');
    const targetValue = document.getElementById('target-value');
    
    if (bmrValue) bmrValue.textContent = metrics.bmr + ' kcal';
    if (tdeeValue) tdeeValue.textContent = metrics.tdee + ' kcal';
    if (targetValue) targetValue.textContent = metrics.calorieTarget + ' kcal';
    
    // Update macro targets
    document.getElementById('target-protein').textContent = metrics.macros.protein + 'g';
    document.getElementById('target-carbs').textContent = metrics.macros.carbs + 'g';
    document.getElementById('target-fat').textContent = metrics.macros.fat + 'g';
    document.getElementById('target-fiber').textContent = metrics.macros.fiber + 'g';
  }
}

function saveProfile() {
  const profile = {
    name: document.getElementById('name').value,
    phone: document.getElementById('phone').value,
    email: document.getElementById('email').value,
    age: parseInt(document.getElementById('age').value),
    height: parseFloat(document.getElementById('height').value),
    weight: parseFloat(document.getElementById('weight').value),
    sex: document.getElementById('sex').value,
    goal: document.getElementById('goal').value,
    activityLevel: document.getElementById('activity-level').value,
    dietPreference: document.getElementById('diet-preference').value,
    healthConditions: document.getElementById('health-conditions').value,
    allergies: document.getElementById('allergies').value
  };
  
  // Calculate and add targets
  const metrics = calculateAllMetrics(profile);
  profile.bmi = metrics.bmi;
  profile.bmr = metrics.bmr;
  profile.tdee = metrics.tdee;
  profile.targets = {
    calorieTarget: metrics.calorieTarget,
    macros: metrics.macros
  };
  
  store.setProfile(profile);
  navigateTo('mealPlanner');
}

// ============================================
// MEAL PLANNER SCREEN
// ============================================

function initMealPlannerScreen() {
  // Get time-based meal configuration
  const context = getContextualMealPrompt();
  const slots = getMealSlotsForCurrentTime();
  
  // Update header with contextual greeting
  updateMealPlannerHeader(context);
  
  // Show/hide meal slots based on time
  updateVisibleMealSlots(slots);
  
  // Initialize visible slots
  slots.forEach(slot => {
    initMealSlot(slot.id, slot);
  });
  
  // Analyze button
  const analyzeBtn = document.getElementById('analyze-meals-btn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      navigateTo('analysis');
    });
  }
}

function updateMealPlannerHeader(context) {
  const header = document.querySelector('.meal-planner-screen .screen-header');
  if (header) {
    header.innerHTML = `
      <h2>${context.greeting}</h2>
      <p>${context.message}</p>
      ${context.remainingNutrition.consumed.calories > 0 ? `
        <div style="margin-top: 1rem; padding: 1rem; background: #f0fdf4; border-radius: 0.5rem; display: inline-block;">
          <strong>Today's Progress:</strong> ${context.remainingNutrition.consumed.calories} / ${context.remainingNutrition.targets.calories} kcal
          <div style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
            Remaining: ${context.remainingNutrition.calories} kcal
          </div>
        </div>
      ` : ''}
    `;
  }
}

function updateVisibleMealSlots(slots) {
  // Hide all slots first
  const allSlots = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
  allSlots.forEach(slotId => {
    const slotEl = document.getElementById(`${slotId}-slot`);
    if (slotEl) {
      slotEl.style.display = 'none';
    }
  });
  
  // Show only the slots we need
  slots.forEach(slot => {
    const slotEl = document.getElementById(`${slot.id}-slot`);
    if (slotEl) {
      slotEl.style.display = 'block';
      
      // Update the prompt text
      const promptEl = slotEl.querySelector('.meal-prompt');
      if (promptEl && slot.prompt) {
        promptEl.textContent = slot.prompt;
      }
      
      // Add missed meal styling
      if (slot.isMissed) {
        slotEl.classList.add('missed-meal');
        const titleEl = slotEl.querySelector('h3');
        if (titleEl) {
          titleEl.innerHTML = `${slot.title} <span class="missed-badge">Missed</span>`;
        }
      }
    }
  });
}

function initMealSlot(slot, slotConfig = null) {
  const container = document.getElementById(`${slot}-slot`);
  if (!container || container.style.display === 'none') return;
  
  // Text input
  const textInput = container.querySelector('.ingredient-text-input');
  const addBtn = container.querySelector('.add-ingredient-btn');
  
  if (textInput && addBtn) {
    addBtn.addEventListener('click', () => {
      addIngredient(slot, textInput.value);
      textInput.value = '';
    });
    
    textInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addIngredient(slot, textInput.value);
        textInput.value = '';
      }
    });
  }
  
  // Voice input
  const voiceBtn = container.querySelector('.voice-btn');
  if (voiceBtn) {
    if (voiceInput.isSupported()) {
      voiceBtn.addEventListener('click', (e) => {
        const button = e.currentTarget;
        
        voiceInput.toggleForButton(
          button,
          (result) => {
            if (result.isFinal && result.final.trim()) {
              const ingredients = parseVoiceIngredients(result.final);
              ingredients.forEach(ing => addIngredient(slot, ing));
              showNotification(`Added: ${ingredients.join(', ')}`, 'success');
            }
          },
          (error) => {
            showNotification('Voice input: ' + error, 'error');
          }
        );
      });
    } else {
      voiceBtn.style.display = 'none';
      console.warn('Web Speech API not supported in this browser');
    }
  }
  
  // Image upload
  const imageInput = container.querySelector('.image-input');
  const uploadBtn = container.querySelector('.upload-btn');
  
  if (uploadBtn && imageInput) {
    uploadBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => handleImageUpload(slot, e.target.files[0]));
  }
  
  // Servings selector
  const servingsSelect = container.querySelector('.servings-select');
  if (servingsSelect) {
    servingsSelect.addEventListener('change', () => {
      updateMealServings(slot, parseInt(servingsSelect.value));
    });
  }
}

function addIngredient(slot, ingredient) {
  if (!ingredient.trim()) return;
  
  const list = document.getElementById(`${slot}-ingredients`);
  if (!list) return;
  
  const item = document.createElement('div');
  item.className = 'ingredient-tag';
  item.innerHTML = `
    <span>${ingredient}</span>
    <button class="remove-ingredient" onclick="this.parentElement.remove()">×</button>
  `;
  
  list.appendChild(item);
}

async function handleImageUpload(slot, file) {
  if (!file) return;
  
  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById(`${slot}-image-preview`);
    if (preview) {
      preview.innerHTML = `<img src="${e.target.result}" alt="Food">`;
      preview.classList.remove('hidden');
    }
  };
  reader.readAsDataURL(file);
  
  // Simulate AI detection (in real app, send to vision API)
  showNotification('Analyzing image for ingredients...', 'info');
  
  setTimeout(() => {
    // Mock detected ingredients
    const mockIngredients = ['chicken breast', 'broccoli', 'rice', 'olive oil'];
    mockIngredients.forEach(ing => addIngredient(slot, ing));
    showNotification('Ingredients detected!', 'success');
  }, 1500);
}

function updateMealServings(slot, servings) {
  const currentMeals = store.getMeals(store.getState().currentDate);
  if (currentMeals[slot]) {
    currentMeals[slot].servings = servings;
  }
}

function collectMealData() {
  const meals = {};
  
  mealSlots.forEach(slot => {
    const list = document.getElementById(`${slot}-ingredients`);
    const servings = document.querySelector(`#${slot}-slot .servings-select`)?.value || 1;
    
    if (list) {
      const ingredients = Array.from(list.querySelectorAll('.ingredient-tag span')).map(el => el.textContent);
      
      if (ingredients.length > 0) {
        meals[slot] = {
          type: slot,
          ingredients,
          servings: parseInt(servings),
          timestamp: new Date().toISOString()
        };
      }
    }
  });
  
  return meals;
}

// ============================================
// ANALYSIS SCREEN
// ============================================

async function initAnalysisScreen() {
  const profile = store.getProfile();
  const meals = collectMealData();
  
  // Save meals to store
  const today = store.getState().currentDate;
  Object.entries(meals).forEach(([type, meal]) => {
    store.addMeal(today, type, meal);
  });
  
  // Update header with profile info and edit button
  updateAnalysisHeader(profile);
  
  // Initialize tabs
  initChatTab();
  initRecipesTab(meals, profile);
  initStatsTab(meals, profile);
  initHistoryTab();
  
  // Tab switching
  document.querySelectorAll('.analysis-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const tabName = tab.dataset.tab;
      switchAnalysisTab(tabName);
    });
  });
}

function updateAnalysisHeader(profile) {
  const header = document.querySelector('.analysis-screen .screen-header');
  if (header && profile) {
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h2>AI Nutrition Analysis</h2>
          <p>Personalized insights for ${profile.name || 'you'}</p>
        </div>
        <button id="edit-profile-btn" class="btn btn-outline btn-sm">
          ✏️ Edit Profile
        </button>
      </div>
    `;
    
    // Add edit profile handler
    document.getElementById('edit-profile-btn')?.addEventListener('click', () => {
      navigateTo('profile');
    });
  }
}

function switchAnalysisTab(tabName) {
  // Update tab buttons
  document.querySelectorAll('.analysis-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });
  
  // Update tab content
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.toggle('hidden', panel.id !== `${tabName}-panel`);
  });
}

// Chat Tab
function initChatTab() {
  const chatInput = document.getElementById('chat-input');
  const sendBtn = document.getElementById('send-chat-btn');
  const chatMessages = document.getElementById('chat-messages');
  
  // Load chat history
  const history = store.getChatHistory();
  chatMessages.innerHTML = '';
  history.forEach(msg => appendChatMessage(msg));
  
  async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    
    // Add user message
    const userMsg = { role: 'user', content: text };
    store.addChatMessage(userMsg);
    appendChatMessage(userMsg);
    
    chatInput.value = '';
    
    // Get AI response
    showTypingIndicator();
    
    const messages = store.getChatHistory().map(m => ({ role: m.role, content: m.content }));
    const response = await sendToClaude(messages);
    
    hideTypingIndicator();
    
    const aiMsg = { role: 'assistant', content: response.text };
    store.addChatMessage(aiMsg);
    appendChatMessage(aiMsg);
  }
  
  sendBtn.addEventListener('click', sendMessage);
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  
  // Quick reply buttons
  document.querySelectorAll('.quick-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      chatInput.value = btn.textContent;
      sendMessage();
    });
  });
}

function appendChatMessage(message) {
  const container = document.getElementById('chat-messages');
  const div = document.createElement('div');
  div.className = `chat-message ${message.role}`;
  div.innerHTML = `<div class="message-content">${message.content}</div>`;
  container.appendChild(div);
  container.scrollTop = container.scrollHeight;
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const indicator = document.createElement('div');
  indicator.id = 'typing-indicator';
  indicator.className = 'chat-message assistant typing';
  indicator.innerHTML = '<div class="message-content"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div>';
  container.appendChild(indicator);
  container.scrollTop = container.scrollHeight;
}

function hideTypingIndicator() {
  const indicator = document.getElementById('typing-indicator');
  if (indicator) indicator.remove();
}

// Recipes Tab
async function initRecipesTab(meals, profile) {
  const container = document.getElementById('recipes-container');
  container.innerHTML = '<div class="loading">AI is generating personalized recipes based on your day...</div>';
  
  const context = getContextualMealPrompt();
  const currentMealIngredients = meals[context.primaryMeal]?.ingredients || [];
  
  if (currentMealIngredients.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>Add ingredients for your ${context.primaryMeal} to get recipe suggestions</p>
        <p style="margin-top: 0.5rem; font-size: 0.875rem; color: #6b7280;">
          ${context.message}
        </p>
      </div>
    `;
    return;
  }
  
  // Generate contextual prompt
  const prompt = generateContextualRecipePrompt();
  
  // Get AI response with context
  const response = await sendToClaude([
    { role: 'user', content: prompt }
  ]);
  
  store.setAiAnalysis(response);
  
  // Render recipes
  container.innerHTML = '';
  
  // Add context header
  const contextHeader = document.createElement('div');
  contextHeader.className = 'recipe-context-header';
  contextHeader.innerHTML = `
    <h3>${context.greeting} - ${context.primaryMeal.charAt(0).toUpperCase() + context.primaryMeal.slice(1)} Suggestions</h3>
    <p>${context.message}</p>
    <div class="daily-progress-mini">
      <span>Today's intake: ${context.remainingNutrition.consumed.calories} kcal</span>
      <span>Remaining: ${context.remainingNutrition.calories} kcal</span>
    </div>
  `;
  container.appendChild(contextHeader);
  
  if (response.recipes && response.recipes.length > 0) {
    response.recipes.forEach((recipe, index) => {
      const card = createRecipeCard(recipe, index + 1, profile, currentMealIngredients);
      container.appendChild(card);
    });
  } else {
    // Fallback recipes
    const fallbackRecipes = getFallbackRecipes(context.primaryMeal);
    fallbackRecipes.forEach((recipe, index) => {
      const card = createRecipeCard({ content: recipe }, index + 1, profile, currentMealIngredients);
      container.appendChild(card);
    });
  }
  
  // Render sustainability score
  const ecoScore = document.getElementById('eco-score-display');
  if (ecoScore) {
    const score = response.sustainability || Math.floor(Math.random() * 3) + 7;
    ecoScore.innerHTML = createSustainabilityGauge(score);
  }
}

function getFallbackRecipes(mealType) {
  const recipes = {
    breakfast: [
      'Oatmeal with Berries\\nIngredients: oats, blueberries, honey, almond milk\\nInstructions: Cook oats with milk, top with berries and honey',
      'Avocado Toast\\nIngredients: bread, avocado, eggs, lemon\\nInstructions: Toast bread, mash avocado, top with fried egg'
    ],
    lunch: [
      'Grilled Chicken Salad\\nIngredients: chicken, mixed greens, tomatoes, cucumber, olive oil\\nInstructions: Grill chicken, toss with vegetables and dressing',
      'Quinoa Bowl\\nIngredients: quinoa, chickpeas, roasted vegetables, tahini\\nInstructions: Cook quinoa, add roasted veggies and chickpeas'
    ],
    dinner: [
      'Baked Salmon\\nIngredients: salmon, asparagus, lemon, garlic, olive oil\\nInstructions: Bake salmon at 400°F for 15 mins with asparagus',
      'Stir Fry\\nIngredients: tofu, broccoli, bell peppers, soy sauce, ginger\\nInstructions: Stir fry tofu and vegetables with sauce'
    ],
    snack: [
      'Greek Yogurt Parfait\\nIngredients: yogurt, granola, honey, berries\\nInstructions: Layer yogurt with granola and berries',
      'Hummus and Veggies\\nIngredients: hummus, carrots, celery, cucumber\\nInstructions: Serve hummus with cut vegetables'
    ]
  };
  return recipes[mealType] || recipes.breakfast;
}

function createRecipeCard(recipe, number, profile, mealIngredients) {
  const card = document.createElement('div');
  card.className = 'recipe-card';
  
  const lines = recipe.content.split('\n');
  const title = lines[0];
  
  // Parse ingredients from recipe
  let recipeIngredients = [];
  const ingredientsLine = lines.find(l => l.toLowerCase().includes('ingredients:'));
  if (ingredientsLine) {
    recipeIngredients = ingredientsLine
      .replace(/ingredients?:/i, '')
      .split(/[,;]/)
      .map(i => i.trim())
      .filter(i => i.length > 0);
  }
  
  const instructions = lines.find(l => l.toLowerCase().includes('instructions:'))?.replace(/instructions?:/i, '').trim() || '';
  
  // Calculate individual recipe nutrients (mock based on ingredients)
  const ingredientCount = recipeIngredients.length || 3;
  const recipeNutrients = {
    calories: ingredientCount * 120,
    protein: Math.round(ingredientCount * 8),
    carbs: Math.round(ingredientCount * 12),
    fat: Math.round(ingredientCount * 5),
    fiber: Math.round(ingredientCount * 2)
  };
  
  // Calculate progress vs daily targets
  const targets = profile.targets?.macros || { protein: 150, carbs: 250, fat: 65 };
  const calorieTarget = profile.targets?.calorieTarget || 2000;
  
  card.innerHTML = `
    <div class="recipe-header">
      <span class="recipe-number">${number}</span>
      <h4>${title}</h4>
    </div>
    
    <!-- Ingredients Section (Shown First) -->
    <div class="recipe-ingredients-section">
      <h5>🥘 Ingredients from Your Pantry</h5>
      <div class="recipe-ingredients-list">
        ${recipeIngredients.map(ing => `<span class="recipe-ingredient-tag">${ing}</span>`).join('')}
      </div>
    </div>
    
    <!-- Individual Recipe Nutrition -->
    <div class="recipe-nutrition-section">
      <h5>📊 Nutrition per Serving</h5>
      <div class="recipe-nutrition-grid">
        <div class="recipe-nutrient">
          <span class="nutrient-value">${recipeNutrients.calories}</span>
          <span class="nutrient-label">kcal</span>
          <div class="nutrient-bar-bg">
            <div class="nutrient-bar" style="width: ${Math.min((recipeNutrients.calories / calorieTarget) * 100, 100)}%; background: #10b981;"></div>
          </div>
        </div>
        <div class="recipe-nutrient">
          <span class="nutrient-value">${recipeNutrients.protein}g</span>
          <span class="nutrient-label">protein</span>
          <div class="nutrient-bar-bg">
            <div class="nutrient-bar" style="width: ${Math.min((recipeNutrients.protein / targets.protein) * 100, 100)}%; background: #3b82f6;"></div>
          </div>
        </div>
        <div class="recipe-nutrient">
          <span class="nutrient-value">${recipeNutrients.carbs}g</span>
          <span class="nutrient-label">carbs</span>
          <div class="nutrient-bar-bg">
            <div class="nutrient-bar" style="width: ${Math.min((recipeNutrients.carbs / targets.carbs) * 100, 100)}%; background: #f59e0b;"></div>
          </div>
        </div>
        <div class="recipe-nutrient">
          <span class="nutrient-value">${recipeNutrients.fat}g</span>
          <span class="nutrient-label">fat</span>
          <div class="nutrient-bar-bg">
            <div class="nutrient-bar" style="width: ${Math.min((recipeNutrients.fat / targets.fat) * 100, 100)}%; background: #ef4444;"></div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Instructions -->
    <div class="recipe-section">
      <h5>👨‍🍳 Instructions</h5>
      <p>${instructions}</p>
    </div>
    
    <!-- Action Buttons -->
    <div class="recipe-actions">
      <button class="btn btn-primary btn-sm" onclick="showNotification('Recipe saved to favorites!', 'success')">
        ❤️ Save Recipe
      </button>
      <button class="btn btn-outline btn-sm" onclick="showNotification('Shopping list updated!', 'success')">
        🛒 Add to List
      </button>
    </div>
  `;
  
  return card;
}

// Stats Tab
function initStatsTab(meals, profile) {
  // Calculate totals
  const totals = calculateMealTotals(meals);
  const targets = profile.targets || {};
  
  // Update ring chart
  const ringChart = document.getElementById('ring-chart');
  if (ringChart) {
    ringChart.innerHTML = createRingChart(totals, {
      calories: targets.calorieTarget || 2000,
      protein: targets.macros?.protein || 150,
      carbs: targets.macros?.carbs || 250,
      fat: targets.macros?.fat || 65,
      fiber: targets.macros?.fiber || 30
    });
  }
  
  // Update bar chart
  const barChart = document.getElementById('bar-chart');
  if (barChart) {
    barChart.innerHTML = createBarChart(totals, {
      calories: targets.calorieTarget || 2000,
      protein: targets.macros?.protein || 150,
      carbs: targets.macros?.carbs || 250,
      fat: targets.macros?.fat || 65,
      fiber: targets.macros?.fiber || 30
    });
  }
  
  // Update BMI/BMR cards
  document.getElementById('stats-bmi').textContent = profile.bmi?.value || '--';
  document.getElementById('stats-bmi-category').textContent = profile.bmi?.category || '';
  document.getElementById('stats-bmr').textContent = profile.bmr || '--';
  document.getElementById('stats-tdee').textContent = profile.tdee || '--';
}

function calculateMealTotals(meals) {
  const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  
  // Mock calculation - in real app, use nutrition database
  Object.values(meals).forEach(meal => {
    const ingredientCount = meal.ingredients?.length || 0;
    totals.calories += ingredientCount * 80;
    totals.protein += ingredientCount * 5;
    totals.carbs += ingredientCount * 10;
    totals.fat += ingredientCount * 3;
    totals.fiber += ingredientCount * 2;
  });
  
  return totals;
}

// History Tab
function initHistoryTab() {
  const allMeals = store.getAllMeals();
  const container = document.getElementById('history-list');
  
  if (Object.keys(allMeals).length === 0) {
    container.innerHTML = '<div class="empty-state">No meal history yet</div>';
    return;
  }
  
  container.innerHTML = '';
  
  Object.entries(allMeals).forEach(([date, dayMeals]) => {
    const entry = document.createElement('div');
    entry.className = 'history-entry';
    
    const totals = calculateMealTotals(dayMeals);
    const mealCount = Object.keys(dayMeals).length;
    
    entry.innerHTML = `
      <div class="history-date">${formatDate(date)}</div>
      <div class="history-stats">
        <span>${mealCount} meals</span>
        <span>${totals.calories} kcal</span>
      </div>
    `;
    
    container.appendChild(entry);
  });
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// ============================================
// UTILITIES
// ============================================

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => notification.classList.add('show'), 10);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initLoginScreen();
  navigateTo('login');
});
