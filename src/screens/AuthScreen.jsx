import React, { useState } from 'react';
import Btn from '../components/Btn';
import Fld from '../components/Fld';
import { authAPI } from '../utils/api';

const AuthScreen = ({ onLogin, addToast }) => {
  const [mode, setMode] = useState('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Sign up fields
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirm, setSignupConfirm] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      addToast('Please enter email and password', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await authAPI.login(loginEmail, loginPassword);
      addToast('Welcome back! 🌿', 'success');
      onLogin({ email: data.user.email, username: data.user.username }, data.hasProfile || false);
    } catch (err) {
      // Provide clearer error message
      const errorMessage = err.message.includes('No account found') 
        ? 'No account found. Please sign up first! 🌱' 
        : err.message;
      addToast(errorMessage, 'error');
    }
    
    setIsLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (!signupUsername || !signupEmail || !signupPassword || !signupConfirm) {
      addToast('All fields are required', 'error');
      return;
    }
    
    if (signupPassword !== signupConfirm) {
      addToast('Passwords do not match', 'error');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const data = await authAPI.register(signupEmail, signupUsername, signupPassword);
      addToast('Account created! Please complete your profile.', 'success');
      onLogin({ email: data.user.email, username: data.user.username }, false);
    } catch (err) {
      addToast(err.message, 'error');
    }
    
    setIsLoading(false);
  };

  const tabStyle = (isActive) => ({
    flex: 1,
    padding: '12px',
    textAlign: 'center',
    cursor: 'pointer',
    borderBottom: `2px solid ${isActive ? '#4ade80' : '#1a3350'}`,
    color: isActive ? '#4ade80' : '#4a6280',
    fontWeight: isActive ? 600 : 500,
    fontSize: '14px',
    transition: 'all 0.2s ease'
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(180deg, #070d17 0%, #0d1520 100%)'
    }}>
      <div 
        className="animate-fadeUp"
        style={{
          background: '#0d1520',
          borderRadius: '20px',
          border: '1px solid #1a3350',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(74, 222, 128, 0.1)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '32px 24px',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.1) 0%, rgba(14, 165, 233, 0.1) 100%)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4ade80 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '32px',
            boxShadow: '0 0 30px rgba(74, 222, 128, 0.4)'
          }}>
            🌿
          </div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 700,
            color: '#dde6f0',
            margin: '0 0 4px'
          }}>
            NutriAI Pro
          </h1>
          <p style={{
            fontSize: '13px',
            color: '#4a6280',
            margin: 0
          }}>
            AI-Powered Sustainable Nutrition
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #1a3350' }}>
          <div 
            style={tabStyle(mode === 'login')}
            onClick={() => setMode('login')}
          >
            Login
          </div>
          <div 
            style={tabStyle(mode === 'signup')}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '24px' }}>
          {mode === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '16px' }}>
                <Fld
                  label="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <Fld
                  label="Password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
              <Btn
                variant="primary"
                size="lg"
                disabled={isLoading}
                onClick={handleLogin}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Logging in...' : 'Login →'}
              </Btn>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div style={{ marginBottom: '12px' }}>
                <Fld
                  label="Username"
                  value={signupUsername}
                  onChange={(e) => setSignupUsername(e.target.value)}
                  placeholder="Choose a username"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <Fld
                  label="Email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <Fld
                  label="Password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="Create a password"
                />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <Fld
                  label="Confirm Password"
                  type="password"
                  value={signupConfirm}
                  onChange={(e) => setSignupConfirm(e.target.value)}
                  placeholder="Confirm your password"
                />
              </div>
              <Btn
                variant="primary"
                size="lg"
                disabled={isLoading}
                onClick={handleSignup}
                style={{ width: '100%' }}
              >
                {isLoading ? 'Creating account...' : 'Sign Up →'}
              </Btn>
            </form>
          )}
        </div>

        {/* Toggle */}
        <div style={{
          padding: '16px 24px',
          textAlign: 'center',
          borderTop: '1px solid #1a3350',
          background: '#0a1018'
        }}>
          <span style={{ color: '#4a6280', fontSize: '13px' }}>
            {mode === 'login' ? "New here? " : "Already have an account? "}
          </span>
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#4ade80',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
