// In-memory storage - no localStorage
export const DB = {
  d: {}, // meal logs: username_datestring
  p: {}, // profiles: email -> profile data
  u: {}  // registered users: email -> {email, password, username}
};

// Helper to get today's date string
export const getDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Helper to create meal log key
export const getMealKey = (email, dateStr) => `${email}_${dateStr}`;

// Save meal log
export const saveMealLog = (email, mealData) => {
  const dateStr = getDateKey();
  const key = getMealKey(email, dateStr);
  
  if (!DB.d[key]) {
    DB.d[key] = [];
  }
  
  DB.d[key].push({
    ...mealData,
    timestamp: Date.now(),
    date: dateStr
  });
};

// Get meal logs for user
export const getMealLogs = (email) => {
  const logs = [];
  Object.keys(DB.d).forEach(key => {
    if (key.startsWith(`${email}_`)) {
      logs.push(...DB.d[key]);
    }
  });
  return logs.sort((a, b) => b.timestamp - a.timestamp);
};

// Get meal logs for specific date
export const getMealLogsForDate = (email, dateStr) => {
  const key = getMealKey(email, dateStr);
  return DB.d[key] || [];
};

// Save user profile
export const saveProfile = (email, profile) => {
  DB.p[email] = {
    ...profile,
    updatedAt: Date.now()
  };
};

// Get user profile
export const getProfile = (email) => DB.p[email] || null;

// Register user
export const registerUser = (email, password, username) => {
  if (DB.u[email]) {
    return { success: false, error: 'Email already registered' };
  }
  
  DB.u[email] = { email, password, username };
  return { success: true };
};

// Login user
export const loginUser = (email, password) => {
  const user = DB.u[email];
  if (!user) {
    return { success: false, error: 'No account found. Please sign up.' };
  }
  if (user.password !== password) {
    return { success: false, error: 'Incorrect password.' };
  }
  return { success: true, user };
};

// Check if email exists
export const emailExists = (email) => !!DB.u[email];
