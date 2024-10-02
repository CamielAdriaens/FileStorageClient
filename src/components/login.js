import { useEffect, useState } from 'react';
import jwtDecode from 'jwt-decode'; // Correct import for jwt-decode

function App() {
  const [user, setUser] = useState({});

  // Function to handle the Google sign-in response
  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID Token: " + response.credential);

    // Decode the token for frontend display purposes
    var userObject = jwtDecode(response.credential);
    console.log(userObject);

    // Store the token in localStorage
    localStorage.setItem('token', response.credential);

    // Send the token to the backend for verification
    fetch('http://localhost:19269/api/auth/google', { // Adjust this URL based on your backend's local URL
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: response.credential }), // Send token to the backend
    })
    .then(res => res.json())
    .then(data => {
      if (data.token) {
        // Optionally handle backend response, for example, store a JWT if you use one
        console.log('Backend verification successful', data);
      } else {
        console.error('Backend verification failed');
      }
    })
    .catch(error => {
      console.error('Error sending token to backend:', error);
    });

    // Update the state with user info and hide the sign-in button
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;
  }

  // Function to handle user sign-out
  function handleSignOut(event) {
    setUser({});
    localStorage.removeItem('token'); // Clear the token from localStorage
    document.getElementById("signInDiv").hidden = false;
  }

  // UseEffect to handle the initial load, token check, and render the Google button
  useEffect(() => {
    // Check if the user is already signed in (token exists in localStorage)
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);
        setUser(decodedUser);
        document.getElementById("signInDiv").hidden = true;
      } catch (error) {
        console.log("Token invalid or expired", error);
        localStorage.removeItem('token'); // Clear invalid token
      }
    }

    /* global google */
    google.accounts.id.initialize({
      client_id: "911031744599-l50od06i5t89bmdl4amjjhdvacsdonm7.apps.googleusercontent.com", // Replace with your actual Google Client ID
      callback: handleCallbackResponse, // The callback function when a user signs in
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" } // Customize button size and theme as needed
    );

    google.accounts.id.prompt(); // Automatically prompts users if they're already signed in
  }, []);

  return (
    <div className="App">
      <div id="signInDiv"></div>

      {Object.keys(user).length !== 0 && (
        <button onClick={handleSignOut}>Sign Out</button>
      )}

      {user && user.name && (
        <div>
          <p>{user.name}</p>
          <img src={user.picture} alt="Profile" />
        </div>
      )}
    </div>
  );
}

export default App;
