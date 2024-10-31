// components/HomePage.js
import React from 'react';
import { useGoogleAuth } from '../utils/useGoogleAuth';
import '../App.css'; // Ensure this imports the CSS

export const HomePage = () => {
  const { user } = useGoogleAuth(); // Only access user; handleSignOut is no longer needed here

  return (
    <div className="homepage"> {/* Apply the 'homepage' class */}
      <header className="header">
        <div className="logo">Welcome!</div>
      </header>

      <main className="main-content">
        <section className="welcome-section">
          <h1>Welcome!</h1>
          <p>This is the login page for FileStorage</p>
        </section>

        <section className="login-section">
          <div id="signInDiv"></div>
        </section>

        {user && user.name && (
          <section className="user-info-section">
            <h2>{user.name}</h2>
            <img className="profile-pic" src={user.picture} alt="Profile" />
          </section>
        )}
      </main>

      <footer className="footer">
        &copy; 2024 FileStorage. All rights reserved.
      </footer>
    </div>
  );
};
