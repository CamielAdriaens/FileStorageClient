/* global google */

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export function useGoogleAuth() {
  const [user, setUser] = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleCallbackResponse = (response) => {
    const token = response.credential;
    try {
      const userObject = jwtDecode(token);
      setUser(userObject);
      setIsSignedIn(true);
      localStorage.setItem('token', token);
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  };

  const handleSignOut = () => {
    setUser({});
    setIsSignedIn(false);
    localStorage.removeItem('token');
    window.location.reload(); // Optionally refresh the page
  };

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
      // Initialize Google Sign-In if not signed in
      google.accounts.id.initialize({
        client_id: "911031744599-l50od06i5t89bmdl4amjjhdvacsdonm7.apps.googleusercontent.com",
        callback: handleCallbackResponse,
      });
      
      google.accounts.id.renderButton(
        document.getElementById("signInDiv"),
        { theme: "outline", size: "large" }
      );

      // Optional: Show the One Tap prompt
      google.accounts.id.prompt();
    }
  }, []);

  return { user, isSignedIn, handleSignOut };
}