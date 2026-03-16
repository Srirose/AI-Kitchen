import React, { createContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import api from '../services/api';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "your-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id"
};

let app;
let auth;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
} catch (error) {
  console.log('Firebase initialization error:', error);
}

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          try {
            const idToken = await firebaseUser.getIdToken();
            const response = await api.post('/auth/login', {
              email: firebaseUser.email,
              firebaseUid: firebaseUser.uid
            });
            
            const { token: jwtToken, user: userData } = response.data.data;
            localStorage.setItem('token', jwtToken);
            setToken(jwtToken);
            setUser({ ...firebaseUser, ...userData });
          } catch (error) {
            console.error('Backend login error:', error);
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      if (!auth) {
        const response = await api.post('/auth/login', { email, password });
        const { token: jwtToken, user: userData } = response.data.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        return { success: true };
      }

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      
      const response = await api.post('/auth/login', {
        email,
        firebaseUid: userCredential.user.uid
      });
      
      const { token: jwtToken, user: userData } = response.data.data;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser({ ...userCredential.user, ...userData });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  };

  const signup = async (email, password, name) => {
    try {
      if (!auth) {
        const response = await api.post('/auth/signup', { email, password, name });
        const { token: jwtToken, user: userData } = response.data.data;
        localStorage.setItem('token', jwtToken);
        setToken(jwtToken);
        setUser(userData);
        return { success: true };
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      const response = await api.post('/auth/signup', {
        email,
        name,
        firebaseUid: userCredential.user.uid
      });
      
      const { token: jwtToken, user: userData } = response.data.data;
      localStorage.setItem('token', jwtToken);
      setToken(jwtToken);
      setUser({ ...userCredential.user, ...userData });
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || error.message 
      };
    }
  };

  const logout = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
