/**
 * Authentication Module
 * Handles user login, signup, and session management
 */

import {
  registerUser,
  loginUser,
  logoutUser,
  onAuthChange,
  getCurrentUser
} from './firebase.js';

// ============================================
// AUTH STATE MANAGEMENT
// ============================================

/**
 * Initialize authentication state listener
 * Redirects to appropriate page based on auth state
 */
export function initAuth() {
  onAuthChange((user) => {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
      // User is signed in
      console.log('User authenticated:', user.email);
      
      // Redirect from auth pages to dashboard
      if (currentPage === 'login.html' || currentPage === 'signup.html') {
        window.location.href = 'dashboard.html';
      }
    } else {
      // User is signed out
      console.log('User not authenticated');
      
      // Redirect to login if on protected page
      if (currentPage === 'dashboard.html') {
        window.location.href = 'login.html';
      }
    }
  });
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return getCurrentUser() !== null;
}

/**
 * Get current user info
 * @returns {Object|null}
 */
export function getUser() {
  const user = getCurrentUser();
  if (user) {
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL
    };
  }
  return null;
}

// ============================================
// FORM HANDLERS
// ============================================

/**
 * Handle signup form submission
 * @param {Event} event - Form submit event
 */
export async function handleSignup(event) {
  event.preventDefault();
  
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');
  const errorDiv = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');
  
  // Clear previous errors
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
  
  // Validation
  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;
  
  if (!name || !email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  // Show loading state
  setLoading(submitBtn, true);
  
  // Attempt registration
  const result = await registerUser(email, password, name);
  
  setLoading(submitBtn, false);
  
  if (result.success) {
    // Redirect to dashboard on success
    window.location.href = 'dashboard.html';
  } else {
    showError(getErrorMessage(result.code));
  }
}

/**
 * Handle login form submission
 * @param {Event} event - Form submit event
 */
export async function handleLogin(event) {
  event.preventDefault();
  
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('error-message');
  const submitBtn = document.getElementById('submit-btn');
  
  // Clear previous errors
  errorDiv.textContent = '';
  errorDiv.classList.add('hidden');
  
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  
  if (!email || !password) {
    showError('Please enter both email and password');
    return;
  }
  
  // Show loading state
  setLoading(submitBtn, true);
  
  // Attempt login
  const result = await loginUser(email, password);
  
  setLoading(submitBtn, false);
  
  if (result.success) {
    // Redirect to dashboard on success
    window.location.href = 'dashboard.html';
  } else {
    showError(getErrorMessage(result.code));
  }
}

/**
 * Handle logout
 */
export async function handleLogout() {
  const result = await logoutUser();
  
  if (result.success) {
    window.location.href = 'login.html';
  } else {
    console.error('Logout failed:', result.error);
    alert('Logout failed. Please try again.');
  }
}

// ============================================
// UI HELPERS
// ============================================

/**
 * Display error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  if (errorDiv) {
    errorDiv.textContent = message;
    errorDiv.classList.remove('hidden');
  }
}

/**
 * Set loading state on button
 * @param {HTMLElement} button - Button element
 * @param {boolean} isLoading - Loading state
 */
function setLoading(button, isLoading) {
  if (isLoading) {
    button.disabled = true;
    button.dataset.originalText = button.textContent;
    button.innerHTML = '<span class="spinner"></span> Loading...';
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || 'Submit';
  }
}

/**
 * Get user-friendly error message
 * @param {string} errorCode - Firebase error code
 * @returns {string} - User-friendly message
 */
function getErrorMessage(errorCode) {
  const errorMessages = {
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Please check your connection.'
  };
  
  return errorMessages[errorCode] || 'An error occurred. Please try again.';
}

// ============================================
// PASSWORD VISIBILITY TOGGLE
// ============================================

/**
 * Initialize password visibility toggle
 */
export function initPasswordToggle() {
  const toggleBtns = document.querySelectorAll('.password-toggle');
  
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const input = btn.previousElementSibling;
      const type = input.type === 'password' ? 'text' : 'password';
      input.type = type;
      btn.textContent = type === 'password' ? '👁️' : '🙈';
    });
  });
}
