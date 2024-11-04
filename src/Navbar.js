// src/components/Navbar.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './utils/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { isSignedIn, handleSignOut } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    if (!isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <div className="navbar-brand">FileStorage</div>
        <ul className="navbar-links">
          <li><Link to="/">Home</Link></li>
          {isSignedIn && <li><Link to="/file">File Management</Link></li>}
          {isSignedIn && <li><Link to="/activity">Activity Feed</Link></li>}
        </ul>
      </div>
      <div className="navbar-right">
        {isSignedIn && (
          <button className="button signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        )}
        <button onClick={toggleDarkMode} className="button dark-mode-toggle">
          {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;