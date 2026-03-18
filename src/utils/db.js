// In-memory storage for meal logs only (non-sensitive)
// Authentication is handled entirely by the backend API
const store = {
  logs: {}, // key: `${userId}_${dateString}` -> array of meal logs
};

export const getDateKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getMealKey = (userId, dateStr) => `${userId}_${dateStr}`;

export const saveMealLog = (userId, mealData) => {
  const dateStr = getDateKey();
  const key = getMealKey(userId, dateStr);
  if (!store.logs[key]) store.logs[key] = [];
  store.logs[key].push({ ...mealData, timestamp: Date.now(), date: dateStr });
};

export const getMealLogs = (userId) => {
  return Object.entries(store.logs)
    .filter(([key]) => key.startsWith(`${userId}_`))
    .flatMap(([, logs]) => logs)
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const getMealLogsForDate = (userId, dateStr) =>
  store.logs[getMealKey(userId, dateStr)] || [];
