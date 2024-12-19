/* global google */

import { useState, useEffect } from 'react';

export function useGoogleAuth() {
  const [user, setUser] = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);

  const handleCallbackResponse = (response) => {
    const token = response.credential;
    // Send the token to backend for further validation
    fetch('https://localhost:44332/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Credential: token })
    })
    .then(response => response.json())
    .then(data => {
      if (data.jwt) {
        localStorage.setItem('token', data.jwt);
        setUser(data); // Store user info from backend
        setIsSignedIn(true);
      }
    })
    .catch(error => console.error("Authentication failed:", error));
  };

  const handleSignOut = () => {
    setUser({});
    setIsSignedIn(false);
    localStorage.removeItem('token');
    window.location.reload();
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsSignedIn(true); // Assume user is logged in if token is present
    } else {
      // Initialize Google Sign-In
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

  return { user, isSignedIn, handleSignOut };
}
