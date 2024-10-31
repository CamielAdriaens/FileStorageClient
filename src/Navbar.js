// components/Navbar.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGoogleAuth } from './utils/useGoogleAuth'; // Import the custom hook for Google Auth

const Navbar = () => {
  const { user, handleSignOut } = useGoogleAuth(); // Destructure user and handleSignOut from useGoogleAuth
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => !prevMode);
    document.body.classList.toggle('dark-mode'); // Toggle the `dark-mode` class on the body element
  };

  return (
    <nav className={`navbar ${isDarkMode ? 'navbar-dark' : ''}`}>
      <div className="navbar-brand">FileStorage</div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/file">File Management</Link>
        </li>
      </ul>
      <div className="dark-mode-toggle">
        <label>
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <span>Dark Mode</span>
        </label>
      </div>
      {user && Object.keys(user).length !== 0 && (
        <button className="signout-btn" onClick={handleSignOut}>
          Sign Out
        </button>
      )}
    </nav>
  );
};

export default Navbar;
