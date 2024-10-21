/* global google */

import { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export function useGoogleAuth() {
  const [user, setUser] = useState({});
  const [backendAuth, setBackendAuth] = useState(null); // To track backend authentication status or response

  function handleCallbackResponse(response) {
    const token = response.credential;
    console.log("Encoded JWT ID Token: " + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    setUser(userObject);

    try {
      // Decode token
      const userObject = jwtDecode(token);
      localStorage.setItem('token', token);
      setUser(userObject);
      document.getElementById("signInDiv").hidden = true;

      // Send the token to the backend for server-side validation
      authenticateWithBackend(token);

    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  async function authenticateWithBackend(token) {
    try {
      const response = await fetch('https://localhost:44374/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: token }), // Send the token as 'credential'
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setBackendAuth(data); // Handle successful backend response
        console.log("Backend authentication successful:", data);
      } else {
        console.error("Backend authentication failed:", data);
      }
    } catch (error) {
      console.error("Error sending token to backend:", error);
    }
  }
  

  function handleSignOut() {
    setUser({});
    localStorage.removeItem('token');
    document.getElementById("signInDiv").hidden = false;
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        setUser(decodedUser);
        document.getElementById("signInDiv").hidden = true;
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
        { theme: "outline", size: "large" },
        
      );
      google.accounts.id.prompt();
    }
  }, []);

  return { user, backendAuth, handleSignOut };
}
