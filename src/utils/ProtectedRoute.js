/* global google */


import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isSignedIn } = useAuth();

  if (!isSignedIn) {
    // Redirect to homepage if not signed in
    window.location.href = '/'; // Force a reload to show the login button on the homepage
    return null; // Return null as the component won't be rendered
  }

  return children;
};

export default ProtectedRoute;
