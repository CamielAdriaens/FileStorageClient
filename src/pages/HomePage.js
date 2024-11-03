/*global google*/

import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import './HomePage.css';

export const HomePage = () => {
  const { user, isSignedIn } = useAuth();

  return (
    <div className="main-content fade-in">
      <h2>Welcome to FileStorage</h2>

      <section className="welcome-section">
        <p>Securely store, manage, and access your files from anywhere.</p>

        {!isSignedIn ? (
          <div id="signInDiv" className="signin-button">
            {/* Google Sign-In button renders here if not signed in */}
          </div>
        ) : (
          <Link to="/file" className="button">
            Go to File Management
          </Link>
        )}
      </section>

      {isSignedIn && user && (
        <section className="user-info-card">
          <img className="profile-pic" src={user.picture} alt="Profile" />
          <h3>{user.name}</h3>
          <p className="user-email">{user.email}</p>
          <Link to="/file" className="button profile-action-button">
            Manage Files
          </Link>
        </section>
      )}

      <footer className="footer">
        &copy; 2024 FileStorage. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;
