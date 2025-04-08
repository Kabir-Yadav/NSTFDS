import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './style/theme.css';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import UserDashboard from './components/dashboard/user-dashboard';
import AdminDashboard from './components/dashboard/admin-dashboard';
import ProtectedRoute from './protected_routes';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}


          <Route path="/login" element={<LoginPage />} />

          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute allowedRole="user">
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin-dashboard"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;