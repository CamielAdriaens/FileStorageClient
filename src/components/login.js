import React from 'react';
import { useGoogleAuth } from './hooks/useGoogleAuth'; // Import the hook

function LoginPage() {
  const { user, backendAuth, handleSignOut } = useGoogleAuth(); // Use the hook
  google.accounts.id.prompt(); // Automatically prompts users if they're already signed in

  return (
    <div className="login-page">
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

      {backendAuth && (
        <div>
          <p>Backend Auth Response: {backendAuth.Message}</p>
          <p>UserId: {backendAuth.UserId}</p>
          <p>Email: {backendAuth.Email}</p>
        </div>
      )}
    </div>
  );
}

export default LoginPage;
