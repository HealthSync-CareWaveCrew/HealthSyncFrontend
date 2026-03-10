// src/routes/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");

  // No token -> login
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  try {
    const decoded = jwtDecode(token);

    // Token expired?
    const now = Date.now() / 1000;
    if (decoded.exp && decoded.exp < now) {
      localStorage.removeItem("token");
      return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Admin only?
    if (requireAdmin) {
      const userRole = decoded.role || decoded.userRole; 
      if (!userRole || userRole.toLowerCase() !== "admin") {
        return <Navigate to="/login" state={{ from: location }} replace />;
      }
    }

    return children;
  } catch (err) {
    console.error("Token validation error:", err);
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
};

export default ProtectedRoute;
