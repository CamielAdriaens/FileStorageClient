import { useState, useEffect } from 'react';
import axios from 'axios';

export function useGoogleAuth() {
  const [user, setUser] = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Function to determine if the app is running inside Docker or locally
  const getApiBaseUrl = () => {
    // Checking if the app is running in Docker
    if (window.location.hostname === 'backend') {
      return 'http://backend:8080'; // Docker API URL
    } else {
      return 'https://localhost:44332'; // Local API URL
    }
  };

  const handleCallbackResponse = (response) => {
    const token = response.credential;
    // Send the token to backend for further validation
    axios.post(`${getApiBaseUrl()}/api/auth/google`, { Credential: token })
      .then(response => {
        if (response.data.jwt) {
          localStorage.setItem('token', response.data.jwt);
          setUser(response.data); // Store user info from backend
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
