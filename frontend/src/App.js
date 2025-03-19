import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import './style/theme.css';
import LoginPage from './components/Auth/LoginPage';
import RegisterPage from './components/Auth/RegisterPage';
import Dashboard from './components/dashboard/user-dashboard';
import AdminDashboard from './components/dashboard/admin-dashboard';
import RiskMatrix from './components/Auth/matrix';
import RiskTable_ from './components/Auth/matrix_table';
import CostDistributionChart from './components/Auth/piechart';
import LoyaltyTiers from './components/Auth/loyalty';
import GanttChart from './components/Auth/Gantt';

function App() {
  return (
    <ThemeProvider> 
      <Router>
        <Routes>

          {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
          <Route path="/time" element={<GanttChart />} />
          <Route path="/tier" element={<LoyaltyTiers />} />
          <Route path="/pie" element={<CostDistributionChart />} />
          <Route path="/risktable" element={<RiskTable_ />} />
          <Route path="/risk" element={<RiskMatrix />} />
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