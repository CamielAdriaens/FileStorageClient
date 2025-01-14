import React from 'react';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';
import './HomePage.css';

export const HomePage = () => {
  const { user, isSignedIn } = useAuth();

  return (
    <div className="main-content fade-in">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="logo">FileStorage</div>
        <ul className="nav-links">
          <li><a href="#features">Features</a></li>
          <li><a href="#about">About Us</a></li>
          <li><a href="#contact">Contact</a></li>
          {!isSignedIn && <li><a href="#login">Login</a></li>}
        </ul>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-text">
          <h1>Securely Store Your Files</h1>
          <p>Access, organize, and share your files from anywhere in the world.</p>
          {!isSignedIn && (
            <a href="#login" className="primary-button">Get Started for Free</a>
          )}
        </div>
        <div className="hero-image">
          <img src="C:\Users\Camil\Documents\Fontys Sem3 IP\An_illustration_of_a_modern_file_storage_system_in.jpg" alt="File management Image" />
        </div>
      </section>

      {/* Login Section */}
      <section id="login" className="login-section">
        {!isSignedIn ? (
          <div className="login-card">
            <h2>Welcome Back!</h2>
            <p>Sign in to manage your files seamlessly.</p>
            <div id="signInDiv" className="signin-button">
              {/* Google Sign-In button renders here */}
            </div>
          </div>
        ) : (
          <div className="user-info-card">
            <img className="profile-pic" src={user.picture} alt="Profile" />
            <h3>{user.name}</h3>
            <p className="user-email">{user.email}</p>
            <Link to="/file" className="profile-action-button">Manage Your Files</Link>
          </div>
        )}
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <h2>Why Choose FileStorage?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <h3>Secure Storage</h3>
            <p>Your files are protected with state-of-the-art encryption.</p>
          </div>
          <div className="feature-card">
            <h3>Anywhere Access</h3>
            <p>Access your files from any device, anytime.</p>
          </div>
          <div className="feature-card">
            <h3>Easy Sharing</h3>
            <p>Share files with friends and colleagues with just a few clicks.</p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h2>About FileStorage</h2>
        <p>
          FileStorage is a leading file management platform designed to make
          your digital life easier. With secure storage, easy sharing, and
          anywhere access, we empower users to stay connected to their files.
        </p>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <h2>Contact Us</h2>
        <p>If you have any questions or feedback, feel free to reach out to us!</p>
        <a href="mailto:support@filestorage.com" className="button">Email Support</a>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; 2024 FileStorage. All rights reserved.</p>
          <ul className="social-links">
            <li><a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a></li>
            <li><a href="https://twitter.com" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a></li>
          </ul>
        </div>
      </footer>
    </div>
    
  );
  
};

export default HomePage;
