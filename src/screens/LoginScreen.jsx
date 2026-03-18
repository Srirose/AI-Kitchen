import React, { useState } from 'react';
import { Fld, Btn } from '../components';
import { authAPI } from '../utils/api';

export const LoginScreen = ({ onLogin, addToast }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      addToast('Please enter username and password', 'warn');
      return;
    }

    setIsLoading(true);
    try {
      const data = await authAPI.login(username, password);
      addToast(`Welcome back, ${data.user.username}!`, 'success');
      onLogin({ email: data.user.email, username: data.user.username }, data.hasProfile || false);
    } catch (err) {
      addToast(err.message || 'Login failed', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(180deg, #070d17 0%, #0d1520 100%)'
    }}>
      <div 
        className="animate-fadeUp"
        style={{
          width: '100%',
          maxWidth: '360px',
          background: '#111e2e',
          borderRadius: '24px',
          padding: '40px 32px',
          border: '1px solid #1a3350',
          boxShadow: '0 0 60px rgba(0, 255, 178, 0.15)'
        }}
      >
        {/* Logo */}
        <div style={{
          textAlign: 'center',
          marginBottom: '32px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #00ffb2 0%, #0ea5e9 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            boxShadow: '0 0 40px rgba(0, 255, 178, 0.4)',
            animation: 'glow 2s ease-in-out infinite'
          }}>
            🌿
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 800,
            color: '#dde6f0',
            marginBottom: '8px'
          }}>
            NutriAI Pro
          </h1>
          <p style={{
            fontSize: '14px',
            color: '#4a6280'
          }}>
            AI-Powered Sustainable Nutrition
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Fld
            label="Username"
            value={username}
            onChange={setUsername}
            placeholder="Enter username"
            required
          />
          <Fld
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            required
          />
          
          <Btn 
            variant="primary" 
            size="lg" 
            type="submit"
            disabled={isLoading}
            style={{ width: '100%', marginTop: '8px' }}
          >
            {isLoading ? 'Signing in...' : 'Sign In →'}
          </Btn>
        </form>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: '#4a6280'
        }}>
          New users are auto-registered
        </p>
      </div>
    </div>
  );
};
