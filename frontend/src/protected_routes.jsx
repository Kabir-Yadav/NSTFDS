// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) return <Navigate to="/login" />;
  if (allowedRole && userRole !== allowedRole) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;
