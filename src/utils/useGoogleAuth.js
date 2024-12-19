import { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance'; // Import the axiosInstance you created

export function useGoogleAuth() {
  const [user, setUser] = useState({});
  const [isSignedIn, setIsSignedIn] = useState(false);

  // Handle Google sign-in callback response
  const handleCallbackResponse = (response) => {
    const token = response.credential;

    // Send the token to the backend for validation via axiosInstance
    axiosInstance.post('/api/auth/google', { Credential: token })
      .then(response => {
        if (response.data.jwt) {
          // Store the JWT token in localStorage
          localStorage.setItem('token', response.data.jwt);
          setUser(response.data); // Store user info from backend
          setIsSignedIn(true);
        }
      })
      .catch(error => console.error("Authentication failed:", error));
  };

  // Handle user sign-out
  const handleSignOut = () => {
    setUser({}); // Clear user data
    setIsSignedIn(false); // Set sign-in status to false
    localStorage.removeItem('token'); // Remove token from localStorage
    window.location.reload(); // Reload the page to reset the state
  };

  // Check if user is already signed in based on token in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsSignedIn(true); // Assume the user is logged in if a token is present
      // Optionally, decode the token to get user info (e.g., jwt-decode) and set it
    } else {
      // Initialize Google Sign-In if no token exists
      google.accounts.id.initialize({
        client_id: "911031744599-l50od06i5t89bmdl4amjjhdvacsdonm7.apps.googleusercontent.com",
        callback: handleCallbackResponse, // Handle the callback response
      });

      // Render the Google sign-in button
      google.accounts.id.renderButton(
        document.getElementById("signInDiv"),
        { theme: "outline", size: "large" }
      );

      // Trigger the Google sign-in prompt
      google.accounts.id.prompt();
    }
  }, []); // Empty dependency array, runs only once when the component mounts

  return { user, isSignedIn, handleSignOut };
}
