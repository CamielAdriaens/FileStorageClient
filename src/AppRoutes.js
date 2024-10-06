import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { FileManagement } from './pages/FileManagement';
import { jwtDecode } from 'jwt-decode';
import { useEffect, useState } from 'react';
import Navbar from './Navbar';  // Import the Navbar component

// Function to check authentication status based on JWT token
const isAuthenticated = () => {
  const token = localStorage.getItem('token'); 
  if (token) {
    try {
      const decodedToken = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      if (decodedToken.exp && decodedToken.exp < currentTime) {
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch (error) {
      console.log('Error decoding token:', error);
      localStorage.removeItem('token');
      return false;
    }
  }
  return false;
};

// ProtectedRoute component to protect routes
const ProtectedRoute = ({ children }) => {
  const [authenticated, setAuthenticated] = useState(null);

  useEffect(() => {
    const authStatus = isAuthenticated();
    setAuthenticated(authStatus);
  }, []);

  if (authenticated === null) {
    return <div>Loading...</div>;  // Loading state while checking authentication
  }

  return authenticated ? children : <Navigate to="/" />;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      {/* Navbar is outside Routes so it renders on every page */}
      <Navbar />  

      <Routes>
        {/* Public Route */}
        <Route path="/" element={<HomePage />} />

        {/* Protected Route */}
        <Route
          path="/file"
          element={
            <ProtectedRoute>
              <FileManagement />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};
