const fs = require('fs');
const path = require('path');

// Persistent JSON file-based storage
const DB_FILE = path.join(__dirname, 'database.json');

// Default empty store structure
const defaultStore = {
  users: {},        // keyed by email: { email, passwordHash, username, createdAt }
  profiles: {},     // keyed by email: { ...profileData }
  logs: {},         // keyed by email_date: { ...logData }
};

// Load data from file or create new
function load() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading database:', err.message);
  }
  
  // Return default if file doesn't exist or error occurred
  return { ...defaultStore };
}

// Save data to file
function save(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving database:', err.message);
    return false;
  }
}

// Initialize store with persistent data
const store = load();

// Export store with persistence methods
module.exports = {
  ...store,
  
  // Get all data
  getAll() {
    return load();
  },
  
  // Save current state
  persist() {
    return save(store);
  },
  
  // Clear all data (for testing)
  clear() {
    Object.keys(defaultStore).forEach(key => {
      store[key] = {};
    });
    return save(store);
  }
};
