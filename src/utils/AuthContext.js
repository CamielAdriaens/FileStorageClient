/* global google */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Handle login callback from Google
  const handleCallbackResponse = (response) => {
    const token = response.credential;
    try {
      const userObject = jwtDecode(token);
      setUser(userObject);
      localStorage.setItem('token', token);
      setIsSignedIn(true); // Set signed-in state to true
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  // Logout function with redirect to homepage
  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    
    // Redirect to the homepage and reload
    window.location.href = '/';
  };

  // Initialize Google sign-in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const userObject = jwtDecode(token);
        setUser(userObject);
        setIsSignedIn(true);
      } catch (error) {
        console.error("Token invalid or expired", error);
        localStorage.removeItem('token');
      }
    } else {
      // Initialize Google Sign-In if not logged in
      google.accounts.id.initialize({
        client_id: "911031744599-l50od06i5t89bmdl4amjjhdvacsdonm7.apps.googleusercontent.com",
        callback: handleCallbackResponse,
      });

      google.accounts.id.renderButton(
        document.getElementById("signInDiv"),
        { theme: "outline", size: "large" }
      );

      // Show the One Tap prompt
      google.accounts.id.prompt();
    }
  }, []); // Run only once on initial load

  return (
    <AuthContext.Provider value={{ user, isSignedIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
