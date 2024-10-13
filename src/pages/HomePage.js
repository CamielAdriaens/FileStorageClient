import React from 'react';
import { useGoogleAuth } from '../utils/useGoogleAuth';
import '../App.css'; // Ensure this imports the CSS

export const HomePage = () => {
  const { user, backendAuth, handleSignOut } = useGoogleAuth(); // Use the hook

  return (
    <div className="homepage"> {/* Apply the 'homepage' class */}
      <header className="header">
        <div className="logo">Welcome!</div>
        {Object.keys(user).length !== 0 && (
          <button className="signout-btn" onClick={handleSignOut}>
            Sign Out
          </button>
        )}
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

        {backendAuth && (
          <section className="backend-auth-info">
            <p>Backend Auth Response: {backendAuth.Message}</p>
            <p>UserId: {backendAuth.UserId}</p>
            <p>Email: {backendAuth.Email}</p>
          </section>
        )}
      </main>

      <footer className="footer">
        &copy; 2024 FileStorage. All rights reserved.
      </footer>
    </div>
  );
};
