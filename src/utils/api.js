const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const TIMEOUT_MS = 15000;

let authToken = null;

export const setToken = (token) => {
  authToken = token;
};

export const getToken = () => authToken;

export const clearToken = () => {
  authToken = null;
};

const fetchWithTimeout = (url, options) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
};

const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  let response;
  try {
    response = await fetchWithTimeout(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw new Error('Network error. Please check your connection.');
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }

  return data;
};

// Auth API
export const authAPI = {
  register: async (email, username, password) => {
    const data = await fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },

  login: async (email, password) => {
    const data = await fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) setToken(data.token);
    return data;
  },
};

// Profile API
export const profileAPI = {
  get: async () => fetchAPI('/profile'),

  save: async (profile) => fetchAPI('/profile', {
    method: 'POST',
    body: JSON.stringify({ profile }),
  }),
};

// Ingredients API
export const ingredientsAPI = {
  detectFromImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    const headers = {};
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    let response;
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
      response = await fetch(`${API_BASE}/ingredients/detect`, {
        method: 'POST',
        headers,
        body: formData,
        signal: controller.signal,
      });
      clearTimeout(timer);
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your connection.');
      }
      throw new Error('Network error. Please check your connection.');
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Detection failed');
    }
    return data;
  },
};

// Analyze API
export const analyzeAPI = {
  chat: async (messages, profile, mealPlan, imageBase64 = null, imageMimeType = null) =>
    fetchAPI('/analyze/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, profile, mealPlan, imageBase64, imageMimeType }),
    }),
};

// Logs API
export const logsAPI = {
  getAll: async () => fetchAPI('/logs'),

  getByDate: async (date) => fetchAPI(`/logs/${encodeURIComponent(date)}`),

  save: async (date, mealPlan, nutriData, messages) =>
    fetchAPI('/logs', {
      method: 'POST',
      body: JSON.stringify({ date, mealPlan, nutriData, messages }),
    }),
};

export default {
  auth: authAPI,
  profile: profileAPI,
  ingredients: ingredientsAPI,
  analyze: analyzeAPI,
  logs: logsAPI,
  setToken,
  getToken,
  clearToken,
};
