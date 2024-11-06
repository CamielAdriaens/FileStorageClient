/* global google */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode}  from 'jwt-decode'; // Remove `jwtDecode` from destructuring if needed

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Send Google token to the back-end for validation and to get the server-generated JWT
  const authenticateWithBackend = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/google', {
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
    } catch (error) {
      console.error("Backend authentication failed:", error);
    }
  };

  // Handle Google Sign-In callback
  const handleCallbackResponse = (response) => {
    const googleToken = response.credential;
    authenticateWithBackend(googleToken); // Authenticate with back-end
  };

  // Logout function with redirect to homepage
  const handleSignOut = () => {
    setUser(null);
    setIsSignedIn(false);
    localStorage.removeItem('token');
    window.location.href = '/'; // Redirect to the homepage
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
