import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './style/theme.css';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import UserDashboard from './components/dashboard/user-dashboard';
import AdminDashboard from './components/dashboard/admin-dashboard';
import ProtectedRoute from './protected_routes';
import { supabase } from './supabaseClient'; // Import Supabase client


function App() {
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Replace 'your_table_name' with the name of a table in your Supabase database
        const { data, error } = await supabase.from('schools').select('*');
        if (error) {
          console.error('Error fetching data from Supabase:', error.message);
        } else {
          console.log('Supabase connection successful. Data:', data);
        }
      } catch (err) {
        console.error('Unexpected error:', err);
      }
    };

    testConnection();
  }, []);
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