/**
 * In-Memory Storage Store
 * Manages application state without persistent storage
 */

class Store {
  constructor() {
    this.state = {
      user: null,
      profile: null,
      meals: {},
      currentDate: new Date().toISOString().split('T')[0],
      chatHistory: [],
      aiAnalysis: null
    };
    this.listeners = new Map();
  }

  // Get current state
  getState() {
    return { ...this.state };
  }

  // Subscribe to state changes
  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);
    
    // Return unsubscribe function
    return () => this.listeners.get(key).delete(callback);
  }

  // Notify listeners of state change
  notify(key, data) {
    if (this.listeners.has(key)) {
      this.listeners.get(key).forEach(callback => callback(data));
    }
  }

  // User actions
  setUser(user) {
    this.state.user = user;
    this.notify('user', user);
  }

  logout() {
    this.state.user = null;
    this.state.profile = null;
    this.state.meals = {};
    this.state.chatHistory = [];
    this.notify('user', null);
  }

  // Profile actions
  setProfile(profile) {
    this.state.profile = { ...this.state.profile, ...profile };
    this.notify('profile', this.state.profile);
  }

  getProfile() {
    return this.state.profile;
  }

  // Meal actions
  addMeal(date, mealType, mealData) {
    if (!this.state.meals[date]) {
      this.state.meals[date] = {};
    }
    this.state.meals[date][mealType] = mealData;
    this.notify('meals', this.state.meals);
  }

  getMeals(date) {
    return this.state.meals[date] || {};
  }

  getAllMeals() {
    return this.state.meals;
  }

  // Chat actions
  addChatMessage(message) {
    this.state.chatHistory.push({
      ...message,
      timestamp: new Date().toISOString()
    });
    this.notify('chat', this.state.chatHistory);
  }

  getChatHistory() {
    return this.state.chatHistory;
  }

  clearChat() {
    this.state.chatHistory = [];
    this.notify('chat', []);
  }

  // AI Analysis
  setAiAnalysis(analysis) {
    this.state.aiAnalysis = analysis;
    this.notify('analysis', analysis);
  }

  getAiAnalysis() {
    return this.state.aiAnalysis;
  }
}

// Export singleton instance
export const store = new Store();
