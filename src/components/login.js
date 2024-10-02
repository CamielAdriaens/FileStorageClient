import { useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import { useState } from 'react';

function App() {
  const [user, setUser] = useState({});

  function handleCallbackResponse(response) {
    console.log("Encoded JWT ID Token: " + response.credential);
    var userObject = jwtDecode(response.credential);
    console.log(userObject);
    
    // Store the token in localStorage
    localStorage.setItem('token', response.credential);
    
    setUser(userObject);
    document.getElementById("signInDiv").hidden = true;
  }

  function handleSignOut(event) {
    // Clear user state and remove token from localStorage
    setUser({});
    localStorage.removeItem('token');
    document.getElementById("signInDiv").hidden = false;
  }

  useEffect(() => {
    // Check if a token exists in localStorage
    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      try {
        // Decode the stored token to retrieve user information
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
      client_id: "911031744599-l50od06i5t89bmdl4amjjhdvacsdonm7.apps.googleusercontent.com",
      callback: handleCallbackResponse // callback function
    });

    google.accounts.id.renderButton(
      document.getElementById("signInDiv"),
      { theme: "outline", size: "large" }
    );

    google.accounts.id.prompt();
  }, []);

  return (
    <div className="App">
      <div id="signInDiv"></div>
      
      {/* Show sign out button only when user is logged in */}
      {Object.keys(user).length !== 0 && (
        <button onClick={handleSignOut}>Sign Out</button>
      )}

      {/* Display user information when logged in */}
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
