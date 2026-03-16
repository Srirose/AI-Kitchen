const API_BASE = 'http://localhost:5000/api';

// Get token from memory (set by App.jsx)
let authToken = null;

export const setToken = (token) => {
  authToken = token;
  localStorage.setItem('token', token);
};

export const getToken = () => authToken;

export const clearToken = () => {
  authToken = null;
  localStorage.removeItem('token');
};

// Generic fetch wrapper
const fetchAPI = async (endpoint, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Use memory token or fallback to localStorage
  const token = authToken || localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
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
  get: async () => {
    return fetchAPI('/profile');
  },

  save: async (profile) => {
    return fetchAPI('/profile', {
      method: 'POST',
      body: JSON.stringify({ profile }),
    });
  },
};

// Ingredients API
export const ingredientsAPI = {
  detectFromImage: async (file) => {
    const formData = new FormData();
    formData.append('image', file);

    // Use memory token or fallback to localStorage
    const token = authToken || localStorage.getItem('token');

    const response = await fetch(`${API_BASE}/ingredients/detect`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || ''}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Detection failed');
    }

    return data;
  },
};

// Analyze API
export const analyzeAPI = {
  chat: async (messages, profile, mealPlan, imageBase64 = null, imageMimeType = null) => {
    return fetchAPI('/analyze/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, profile, mealPlan, imageBase64, imageMimeType }),
    });
  },
};

// Logs API
export const logsAPI = {
  getAll: async () => {
    return fetchAPI('/logs');
  },

  getByDate: async (date) => {
    return fetchAPI(`/logs/${date}`);
  },

  save: async (date, mealPlan, nutriData, messages) => {
    return fetchAPI('/logs', {
      method: 'POST',
      body: JSON.stringify({ date, mealPlan, nutriData, messages }),
    });
  },
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
