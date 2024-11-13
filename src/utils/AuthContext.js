/* global google */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Send Google token to backend for validation and JWT generation
  const authenticateWithBackend = async (token) => {
    try {
      const response = await fetch('https://localhost:44332/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Credential: token })
      });

      if (!response.ok) throw new Error('Failed to authenticate with the backend');

      const data = await response.json();

      if (data.jwt) {
        localStorage.setItem('token', data.jwt);
        setUser(data);
        setIsSignedIn(true);
        console.log("Successfully authenticated with backend!", data);
      } else {
        throw new Error('JWT token missing in response');
      }
    } catch (error) {
      console.error("Backend authentication failed:", error);
    }
  };

  const handleCallbackResponse = (response) => {
    const token = response.credential;
    authenticateWithBackend(token); // Send Google token to backend
  };

  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsSignedIn(true);
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