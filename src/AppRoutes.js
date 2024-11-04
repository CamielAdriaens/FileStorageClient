import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
<<<<<<< Updated upstream
import { FileUpload } from './pages/FileUpload';
import { jwtDecode } from 'jwt-decode'; // Correct import for jwt-decode
import { useEffect } from 'react';
import { useState } from 'react';

const isAuthenticated = () => {
    const token = localStorage.getItem('token');  // Check if token exists
    if (token) {
        try {
            // Decode the token to verify its validity
            const decodedToken = jwtDecode(token);

            // Optionally, you can also check if the token has expired (if it contains an exp field)
            const currentTime = Date.now() / 1000;
            if (decodedToken.exp && decodedToken.exp < currentTime) {
                // Token has expired
                localStorage.removeItem('token');
                return false;
            }

            // Token is valid and not expired
            return true;
        } catch (error) {
            console.log("Error decoding token", error);
            // Token is invalid
            localStorage.removeItem('token');
            return false;
        }
    } else {
        // No token found in localStorage
        return false;
    }
=======
import { FileManagement } from './pages/FileManagement';
import ActivityFeedPage from './pages/ActivityFeedPage';
import Navbar from './Navbar';
import ProtectedRoute from './utils/ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        
        <Route
          path="/file"
          element={
            <ProtectedRoute>
              <FileManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activity"
          element={
            <ProtectedRoute>
              <ActivityFeedPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
>>>>>>> Stashed changes
};


const ProtectedRoute = ({ children }) => {
    return isAuthenticated() ? children : <Navigate to="/" />;
};

export const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" Component={HomePage} />
                <Route 
                    path="/file-upload" 
                    element={
                        <ProtectedRoute>
                            <FileUpload />
                        </ProtectedRoute>
                    } 
                />
            </Routes>
        </BrowserRouter>
    );
};
