require("dotenv").config();
const fs = require('fs').promises;
const path = require('path');

// Database file paths
const DB_FILE = path.join(__dirname, 'database.json');
const STATS_FILE = path.join(__dirname, 'user_stats.json');
const NOTIFICATIONS_FILE = path.join(__dirname, 'notifications.json');

// Initialize files
async function initializeDatabases() {
  try {
    // Main database
    try {
      await fs.access(DB_FILE);
    } catch {
      await fs.writeFile(DB_FILE, JSON.stringify({
        users: {},
        profiles: {},
        logs: {},
        recipes: {},
        ingredients_history: {}
      }, null, 2));
    }

    // Stats database
    try {
      await fs.access(STATS_FILE);
    } catch {
      await fs.writeFile(STATS_FILE, JSON.stringify({
        daily_stats: {},
        weekly_summaries: {},
        monthly_summaries: {}
      }, null, 2));
    }

    // Notifications database
    try {
      await fs.access(NOTIFICATIONS_FILE);
    } catch {
      await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({
        notifications: [],
        email_queue: []
      }, null, 2));
    }

    console.log('✅ Databases initialized');
  } catch (err) {
    console.error('❌ Database initialization error:', err.message);
  }
}

// Load data from file
async function load(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error loading ${filePath}:`, err.message);
    return {};
  }
}

// Save data to file
async function save(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error saving ${filePath}:`, err.message);
    return false;
  }
}

// Calculate daily nutrition totals
function calculateDailyTotals(mealPlan) {
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0
  };

  if (!mealPlan || !mealPlan.meals) return totals;

  Object.values(mealPlan.meals).forEach(meal => {
    if (meal.nutrition) {
      totals.calories += meal.nutrition.calories || 0;
      totals.protein += meal.nutrition.protein || 0;
      totals.carbs += meal.nutrition.carbs || 0;
      totals.fat += meal.nutrition.fat || 0;
      totals.fiber += meal.nutrition.fiber || 0;
      totals.sugar += meal.nutrition.sugar || 0;
      totals.sodium += meal.nutrition.sodium || 0;
    }
  });

  return totals;
}

// Compare intake vs targets
function compareWithTargets(dailyTotals, targets) {
  const comparison = {};
  
  Object.keys(targets).forEach(key => {
    const actual = dailyTotals[key] || 0;
    const target = targets[key] || 0;
    const percentage = target > 0 ? Math.round((actual / target) * 100) : 0;
    
    comparison[key] = {
      actual,
      target,
      percentage,
      status: percentage >= 90 && percentage <= 110 ? 'on_track' : 
              percentage < 90 ? 'below' : 'above',
      difference: actual - target
    };
  });

  return comparison;
}

// Store daily stats for a user
async function storeDailyStats(email, date, mealPlan, profile) {
  try {
    const statsData = await load(STATS_FILE);
    
    const dailyTotals = calculateDailyTotals(mealPlan);
    const targets = {
      calories: profile?.tdee || 2000,
      protein: profile?.goal === 'Weight Loss' ? 120 : 150,
      carbs: 250,
      fat: 65,
      fiber: 30
    };

    const comparison = compareWithTargets(dailyTotals, targets);

    const statEntry = {
      date,
      totals: dailyTotals,
      targets,
      comparison,
      meals_count: Object.keys(mealPlan?.meals || {}).length,
      timestamp: Date.now()
    };

    // Store in daily_stats
    const key = `${email}_${date}`;
    statsData.daily_stats[key] = statEntry;

    await save(STATS_FILE, statsData);
    console.log(`✅ Daily stats stored for ${email} on ${date}`);
    
    return statEntry;
  } catch (err) {
    console.error('Error storing daily stats:', err.message);
    return null;
  }
}

// Generate weekly summary
async function generateWeeklySummary(email, weekStart, weekEnd) {
  try {
    const statsData = await load(STATS_FILE);
    const userProfile = await load(DB_FILE);
    
    const profile = userProfile.profiles[email];
    if (!profile) throw new Error('Profile not found');

    // Get all days in this week
    const weekStats = [];
    const dates = [];
    
    let currentDate = new Date(weekStart);
    const endDate = new Date(weekEnd);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const key = `${email}_${dateStr}`;
      
      if (statsData.daily_stats[key]) {
        weekStats.push(statsData.daily_stats[key]);
        dates.push(dateStr);
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    if (weekStats.length === 0) {
      return null; // No data for this week
    }

    // Calculate averages
    const avgCalories = Math.round(weekStats.reduce((sum, s) => sum + s.totals.calories, 0) / weekStats.length);
    const avgProtein = Math.round(weekStats.reduce((sum, s) => sum + s.totals.protein, 0) / weekStats.length);
    const avgCarbs = Math.round(weekStats.reduce((sum, s) => sum + s.totals.carbs, 0) / weekStats.length);
    const avgFat = Math.round(weekStats.reduce((sum, s) => sum + s.totals.fat, 0) / weekStats.length);

    // Count goal achievement
    const daysOnTrack = weekStats.filter(s => 
      s.comparison.calories.percentage >= 90 && s.comparison.calories.percentage <= 110
    ).length;

    const summary = {
      email,
      weekStart,
      weekEnd,
      daysLogged: weekStats.length,
      averageIntake: {
        calories: avgCalories,
        protein: avgProtein,
        carbs: avgCarbs,
        fat: avgFat
      },
      goalAchievement: {
        daysOnTrack,
        totalDays: weekStats.length,
        percentage: Math.round((daysOnTrack / weekStats.length) * 100),
        status: daysOnTrack >= weekStats.length * 0.7 ? 'excellent' : 
                daysOnTrack >= weekStats.length * 0.5 ? 'good' : 'needs_improvement'
      },
      suggestions: generateSuggestions(avgCalories, avgProtein, profile),
      generatedAt: Date.now()
    };

    // Store weekly summary
    const weekKey = `${email}_${weekStart}_${weekEnd}`;
    statsData.weekly_summaries[weekKey] = summary;
    await save(STATS_FILE, statsData);

    // Create notification
    await createNotification(email, 'weekly_summary', {
      subject: `Your Weekly Nutrition Report 🌿`,
      summary
    });

    console.log(`✅ Weekly summary generated for ${email}`);
    return summary;
  } catch (err) {
    console.error('Error generating weekly summary:', err.message);
    return null;
  }
}

// Generate personalized suggestions
function generateSuggestions(avgCalories, avgProtein, profile) {
  const suggestions = [];

  const targetCalories = profile?.tdee || 2000;
  const calorieDiff = avgCalories - targetCalories;

  if (Math.abs(calorieDiff) > 200) {
    suggestions.push(
      calorieDiff > 0 
        ? `You're consuming ${Math.round(calorieDiff)} calories more than your target. Consider reducing portion sizes or increasing activity.`
        : `You're consuming ${Math.round(Math.abs(calorieDiff))} calories less than your target. Make sure you're eating enough to meet your energy needs.`
    );
  }

  if (avgProtein < 100) {
    suggestions.push('Try to include more protein-rich foods like chicken, fish, eggs, paneer, or lentils in your meals.');
  }

  if (profile?.goal === 'Weight Loss' && calorieDiff > 100) {
    suggestions.push('For weight loss, aim for a slight calorie deficit. Focus on whole foods and reduce processed snacks.');
  }

  if (profile?.goal === 'Muscle Gain' && avgProtein < 150) {
    suggestions.push('For muscle gain, increase protein intake to 1.6-2.2g per kg of body weight.');
  }

  return suggestions;
}

// Create notification
async function createNotification(email, type, data) {
  try {
    const notifData = await load(NOTIFICATIONS_FILE);
    
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email,
      type,
      data,
      read: false,
      createdAt: Date.now(),
      scheduledFor: Date.now() // Send immediately
    };

    notifData.notifications.push(notification);

    // Add to email queue if it's an email-type notification
    if (type === 'weekly_summary' || type === 'monthly_summary') {
      notifData.email_queue.push({
        ...notification,
        status: 'pending'
      });
    }

    await save(NOTIFICATIONS_FILE, notifData);
    console.log(`✅ Notification created for ${email}: ${type}`);
    
    return notification;
  } catch (err) {
    console.error('Error creating notification:', err.message);
    return null;
  }
}

// Get user's nutrition history
async function getUserHistory(email, startDate, endDate) {
  try {
    const statsData = await load(STATS_FILE);
    const history = [];

    // Get all stats in date range
    Object.keys(statsData.daily_stats)
      .filter(key => key.startsWith(email + '_'))
      .forEach(key => {
        const stat = statsData.daily_stats[key];
        const statDate = key.replace(email + '_', '');
        
        if ((!startDate || statDate >= startDate) && 
            (!endDate || statDate <= endDate)) {
          history.push(stat);
        }
      });

    // Sort by date descending
    history.sort((a, b) => b.timestamp - a.timestamp);

    return history;
  } catch (err) {
    console.error('Error getting user history:', err.message);
    return [];
  }
}

// Store used recipe
async function storeRecipe(email, recipe) {
  try {
    const db = await load(DB_FILE);
    
    if (!db.recipes[email]) {
      db.recipes[email] = [];
    }

    // Check if recipe already exists
    const exists = db.recipes[email].some(r => r.name === recipe.name);
    if (!exists) {
      db.recipes[email].push({
        ...recipe,
        usedCount: 1,
        lastUsed: Date.now(),
        addedAt: Date.now()
      });
      await save(DB_FILE, db);
      console.log(`✅ Recipe stored for ${email}`);
    } else {
      // Update usage count
      const existing = db.recipes[email].find(r => r.name === recipe.name);
      existing.usedCount++;
      existing.lastUsed = Date.now();
      await save(DB_FILE, db);
    }
    
    return true;
  } catch (err) {
    console.error('Error storing recipe:', err.message);
    return false;
  }
}

// Store used ingredients
async function storeIngredients(email, ingredients, mealType, date) {
  try {
    const db = await load(DB_FILE);
    
    if (!db.ingredients_history[email]) {
      db.ingredients_history[email] = [];
    }

    ingredients.forEach(ingredient => {
      db.ingredients_history[email].push({
        ingredient,
        mealType,
        date,
        timestamp: Date.now()
      });
    });

    await save(DB_FILE, db);
    console.log(`✅ Ingredients stored for ${email}`);
    return true;
  } catch (err) {
    console.error('Error storing ingredients:', err.message);
    return false;
  }
}

// Get user's frequently used ingredients
async function getFrequentIngredients(email, limit = 10) {
  try {
    const db = await load(DB_FILE);
    const ingredients = db.ingredients_history[email] || [];

    // Count frequency
    const frequency = {};
    ingredients.forEach(item => {
      frequency[item.ingredient] = (frequency[item.ingredient] || 0) + 1;
    });

    // Convert to array and sort
    const sorted = Object.entries(frequency)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sorted;
  } catch (err) {
    console.error('Error getting frequent ingredients:', err.message);
    return [];
  }
}

// Get unread notifications for user
async function getUserNotifications(email) {
  try {
    const notifData = await load(NOTIFICATIONS_FILE);
    
    return notifData.notifications
      .filter(n => n.email === email)
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (err) {
    console.error('Error getting notifications:', err.message);
    return [];
  }
}

// Mark notification as read
async function markNotificationRead(notificationId) {
  try {
    const notifData = await load(NOTIFICATIONS_FILE);
    
    const notification = notifData.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      await save(NOTIFICATIONS_FILE, notifData);
      return true;
    }
    
    return false;
  } catch (err) {
    console.error('Error marking notification read:', err.message);
    return false;
  }
}

// Process email queue (would be called by cron job in production)
async function processEmailQueue() {
  try {
    const notifData = await load(NOTIFICATIONS_FILE);
    const pendingEmails = notifData.email_queue.filter(e => e.status === 'pending');

    console.log(`📧 Processing ${pendingEmails.length} pending emails...`);

    for (const email of pendingEmails) {
      // In production, send actual email here using Nodemailer/SendGrid
      console.log(`📧 Would send email to ${email.email}: ${email.data.subject}`);
      
      email.status = 'sent';
      email.sentAt = Date.now();
    }

    await save(NOTIFICATIONS_FILE, notifData);
    console.log(`✅ Processed ${pendingEmails.length} emails`);
  } catch (err) {
    console.error('Error processing email queue:', err.message);
  }
}

// Initialize databases on module load
initializeDatabases();

module.exports = {
  // Stats & Analytics
  storeDailyStats,
  generateWeeklySummary,
  getUserHistory,
  
  // Recipes & Ingredients
  storeRecipe,
  storeIngredients,
  getFrequentIngredients,
  
  // Notifications
  createNotification,
  getUserNotifications,
  markNotificationRead,
  processEmailQueue,
  
  // Utilities
  calculateDailyTotals,
  compareWithTargets
};
