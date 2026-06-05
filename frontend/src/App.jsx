import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Navbar from './components/Navbar';
import EmployeeList from './components/EmployeeList';
import Profile from './components/Profile';
import Analytics from './components/Analytics';
import SystemHealth from './components/SystemHealth';

// Setup API URL dynamically, defaulting to localhost:5000 if not in env
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  
  // Views: 'dashboard', 'profile', 'analytics', 'system'
  const [view, setView] = useState('dashboard');
  const [alert, setAlert] = useState(null);

  // Auto-clear alerts after 4 seconds
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Synchronize localStorage when token/user changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Shared authenticated fetch wrapper
  const fetchWithAuth = async (endpoint, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);

    // If unauthorized (token expired/invalid), auto-logout
    if (response.status === 401) {
      handleLogout();
      setAlert({ message: 'Session expired. Please log in again.', type: 'error' });
      throw new Error('Unauthorized');
    }

    return response;
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setView('dashboard');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // If not logged in, show Login/Register view
  if (!token || !user) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card glass-panel">
          {alert && (
            <div className={`alert-box alert-${alert.type}`}>
              {alert.message}
            </div>
          )}
          <Login 
            setToken={setToken} 
            setUser={setUser} 
            setAlert={setAlert} 
            apiBase={API_BASE}
          />
        </div>
      </div>
    );
  }

  // Render the selected view
  const renderView = () => {
    switch (view) {
      case 'dashboard':
        return (
          <EmployeeList 
            fetchWithAuth={fetchWithAuth} 
            user={user} 
            setAlert={setAlert} 
          />
        );
      case 'profile':
        return (
          <Profile 
            fetchWithAuth={fetchWithAuth} 
            user={user} 
            setUser={setUser} 
            setAlert={setAlert} 
          />
        );
      case 'analytics':
        return (
          <Analytics 
            fetchWithAuth={fetchWithAuth} 
            setAlert={setAlert} 
          />
        );
      case 'system':
        return (
          <SystemHealth 
            fetchWithAuth={fetchWithAuth} 
            user={user} 
            setAlert={setAlert} 
          />
        );
      default:
        return (
          <EmployeeList 
            fetchWithAuth={fetchWithAuth} 
            user={user} 
            setAlert={setAlert} 
          />
        );
    }
  };

  return (
    <div className="app-container">
      <Navbar 
        view={view} 
        setView={setView} 
        user={user} 
        handleLogout={handleLogout} 
      />
      <main className="main-content">
        {alert && (
          <div className={`alert-box alert-${alert.type}`} style={{ marginBottom: 0 }}>
            {alert.message}
          </div>
        )}
        {renderView()}
      </main>
    </div>
  );
}

export default App;
