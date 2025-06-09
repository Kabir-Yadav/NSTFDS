import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './style/theme.css';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Dashboard from './components/dashboard/dashboard';
import ProtectedRoute from './protected_routes';
import { supabase } from './supabaseClient'; // Import Supabase client


function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}


          <Route path="/login" element={<LoginPage />} />

          <Route path="/login" element={<LoginPage />} />          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
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