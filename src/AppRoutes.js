import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext'; // Import AuthContext here
import { HomePage } from './pages/HomePage';
import { FileManagement } from './pages/FileManagement';
import ActivityFeedPage from './pages/ActivityFeedPage';
import Navbar from './Navbar';
import ProtectedRoute from './utils/ProtectedRoute';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider> {/* Wrap AuthContext here */}
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
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
