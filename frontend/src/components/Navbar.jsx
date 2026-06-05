import React from 'react';

function Navbar({ view, setView, user, handleLogout }) {
  // Helper to extract initials for avatar
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <nav className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">EH</div>
        <span className="logo-text">Employee Hub</span>
      </div>

      <ul className="nav-links">
        <li 
          className={`nav-item ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          <span className="nav-icon">📁</span>
          <span className="nav-label">Directory</span>
        </li>
        <li 
          className={`nav-item ${view === 'profile' ? 'active' : ''}`}
          onClick={() => setView('profile')}
        >
          <span className="nav-icon">👤</span>
          <span className="nav-label">My Profile</span>
        </li>
        <li 
          className={`nav-item ${view === 'analytics' ? 'active' : ''}`}
          onClick={() => setView('analytics')}
        >
          <span className="nav-icon">📊</span>
          <span className="nav-label">Analytics</span>
        </li>
        <li 
          className={`nav-item ${view === 'system' ? 'active' : ''}`}
          onClick={() => setView('system')}
        >
          <span className="nav-icon">⚙️</span>
          <span className="nav-label">System Health</span>
        </li>
      </ul>

      <div className="profile-card">
        <div className="avatar">
          {getInitials(user?.name)}
        </div>
        <div className="profile-details">
          <span className="profile-name" title={user?.name}>
            {user?.name || 'User'}
          </span>
          <span className="profile-role">
            {user?.role || 'Employee'}
          </span>
        </div>
      </div>
      
      <button 
        type="button" 
        className="logout-btn"
        onClick={handleLogout}
      >
        Sign Out
      </button>
    </nav>
  );
}

export default Navbar;
