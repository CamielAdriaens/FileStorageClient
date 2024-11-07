/*global google*/

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Handle Google sign-in callback
  const handleCallbackResponse = (response) => {
    const googleToken = response.credential;
    authenticateWithBackend(googleToken); // Send the Google token to the backend
  };

  // Authenticate with backend and receive custom JWT
  const authenticateWithBackend = async (googleToken) => {
    try {
      const response = await fetch('https://localhost:44332/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Credential: googleToken })
      });

      if (!response.ok) {
        const errorDetails = await response.json();
        console.error('Failed to authenticate:', errorDetails);
        throw new Error('Failed to authenticate with the backend');
      }

      const data = await response.json();

      // Store the server's JWT token
      localStorage.setItem('token', data.Jwt);
      setUser(data);
      setIsSignedIn(true);

      console.log("Successfully authenticated with the backend!");
      console.log("User Data:", data);
    } catch (error) {
      console.error("Backend authentication failed:", error);
    }
  };

  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  // Initialize Google sign-in
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
      google.accounts.id.initialize({
        client_id: "911031744599-l50od06i5t89bmdl4amjjhdvacsdonm7.apps.googleusercontent.com",
        callback: handleCallbackResponse,
      });
      google.accounts.id.renderButton(
        document.getElementById("signInDiv"),
        { theme: "outline", size: "large" }
      );
      google.accounts.id.prompt();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isSignedIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
