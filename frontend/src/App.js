import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './style/theme.css';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Dashboard from './components/dashboard/user-dashboard';
import AdminDashboard from './components/dashboard/admin-dashboard';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}


          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/user-dashboard" element={<Dashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;