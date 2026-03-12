import React, { useState, useCallback } from 'react';
import Toast from './components/Toast';
import AuthScreen from './screens/AuthScreen';
import ProfileScreen from './screens/ProfileScreen';
import MealPlanner from './screens/MealPlanner';
import AnalysisScreen from './screens/AnalysisScreen';
import { useToast } from './hooks/useToast';
import { clearToken, profileAPI } from './utils/api';

function App() {
  const [screen, setScreen] = useState('auth');
  const [currentUser, setCurrentUser] = useState(null);
  const [mealData, setMealData] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  const handleLogin = useCallback(async (user, hasProfile) => {
    setCurrentUser(user);
    if (hasProfile) {
      setScreen('meal');
    } else {
      // Check if profile exists on backend
      try {
        await profileAPI.get();
        setScreen('meal');
      } catch {
        setScreen('profile');
      }
    }
  }, []);

  const handleProfileComplete = useCallback(() => {
    setScreen('meal');
  }, []);

  const handleAnalyze = useCallback((data) => {
    setMealData(data);
    setScreen('analysis');
  }, []);

  const handleBackToMeals = useCallback(() => {
    setScreen('meal');
  }, []);

  const handleGoToChat = useCallback(() => {
    setScreen('analysis');
  }, []);

  const handleEditProfile = useCallback(() => {
    setScreen('profile');
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setMealData(null);
    clearToken();
    setScreen('auth');
    addToast('Logged out successfully', 'info');
  }, [addToast]);

  const renderScreen = () => {
    switch (screen) {
      case 'auth':
        return (
          <AuthScreen
            onLogin={handleLogin}
            addToast={addToast}
          />
        );
      case 'profile':
        return renderProfileScreen();
      case 'meal':
        return (
          <MealPlanner
            currentUser={currentUser}
            onAnalyze={handleAnalyze}
            onEditProfile={handleEditProfile}
            addToast={addToast}
          />
        );
      case 'analysis':
        return (
          <AnalysisScreen
            currentUser={currentUser}
            mealData={mealData}
            onBack={handleBackToMeals}
            onEditProfile={handleEditProfile}
            onLogout={handleLogout}
            addToast={addToast}
          />
        );
      default:
        return null;
    }
  };

  const renderProfileScreen = () => {
    return (
      <ProfileScreen
        currentUser={currentUser}
        onComplete={handleProfileComplete}
        onGoToChat={handleGoToChat}
        addToast={addToast}
      />
    );
  };

  return (
    <>
      <Toast toasts={toasts} removeToast={removeToast} />
      {renderScreen()}
    </>
  );
}

export default App;
