/* global google */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const AuthContext = createContext();
const baseURL = window.location.hostname === 'localhost' ? 'https://localhost:44332' : 'http://filestorageserverapp:8080';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(config => {
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  
  /// Function to handle Google token and authenticate with backend
  const authenticateWithBackend = async (token) => {
    try {
      const response = await api.post('/api/auth/google', {
        Credential: token,
      });

      if (!response.data.jwt) throw new Error('JWT token missing in response');

      localStorage.setItem('token', response.data.jwt);
      const decodedUser = jwtDecode(response.data.jwt);
      setUser(decodedUser);
      setIsSignedIn(true);
      console.log('Authenticated with backend:', decodedUser);
    } catch (error) {
      console.error('Backend authentication failed:', error);
    }
  };

  const handleCallbackResponse = (response) => {
    const token = response.credential;
    authenticateWithBackend(token); 
  };

  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
  };

  // Load user info from token on initial load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedUser = jwtDecode(token);
        setUser(decodedUser);
        setIsSignedIn(true);
      } catch (error) {
        console.error("Failed to decode token:", error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    } else {
      // Initialize Google sign-in if not signed in
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
  }, []); // Empty dependency array to run only on mount

  return (
    <AuthContext.Provider value={{ user, isSignedIn, handleSignOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
