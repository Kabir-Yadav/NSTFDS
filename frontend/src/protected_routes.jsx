// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

const normalizeAllowedRoles = (allowedRole) => {
  if (!allowedRole) return null;
  if (Array.isArray(allowedRole)) return allowedRole;
  return [allowedRole];
};

const ProtectedRoute = ({ children, allowedRole = null }) => {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const roles = normalizeAllowedRoles(allowedRole);
  if (roles && !roles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
