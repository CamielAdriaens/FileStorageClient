/* global google */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const navigate = useNavigate();

  // Send Google token to the back-end for validation and to get the server-generated JWT
  const authenticateWithBackend = async (token) => {
    try {
      const response = await fetch('http://localhost:39739/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ Credential: token })
      });
      
      if (!response.ok) throw new Error('Failed to authenticate with the backend');

      const data = await response.json();
      
      // Save the server's JWT token
      localStorage.setItem('token', data.jwt);
      setUser(data); // Set the user data (e.g., email, name)
      setIsSignedIn(true);

      console.log("Successfully authenticated with the backend!");
      console.log("User Data:", data);
      console.log("JWT Token:", data.jwt);
    } catch (error) {
      console.error("Backend authentication failed:", error);
    }
  };

  // Handle Google Sign-In callback
  const handleCallbackResponse = (response) => {
    const googleToken = response.credential;
    authenticateWithBackend(googleToken); // Authenticate with backend
  };

  // Logout function with redirect to homepage
  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    navigate('/'); // Redirect to the homepage
  };

  // Function to re-authenticate if the token is expired or invalid
  const reAuthenticate = () => {
    console.warn("Re-authenticating user...");

    // Clear current user data and token
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');

    // Redirect to login page or reinitialize Google Sign-In
    google.accounts.id.prompt();
  };

  // Initialize Google sign-in on component mount or validate existing token
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
        reAuthenticate(); // Trigger re-authentication if token is invalid
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

      google.accounts.id.prompt();
    }
  }, []); // Run only once on initial load

  return (
    <AuthContext.Provider value={{ user, isSignedIn, handleSignOut, reAuthenticate }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
