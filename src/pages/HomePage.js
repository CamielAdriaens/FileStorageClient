import React from 'react';
import { useGoogleAuth } from '../utils/useGoogleAuth';


export const HomePage = () => {
  const { user, backendAuth, handleSignOut } = useGoogleAuth(); // Use the hook

  return (
    <div className="mainContainer">
      <div className={'titleContainer'}>
        <div>Welcome!</div>
      </div>
      <div>This is the login page for FileStorage</div>
      <div className={'buttonContainer'}>
        <div id='signInDiv'></div>

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
    </div>
  );
};
