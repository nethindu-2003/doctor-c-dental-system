import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useAuth();
  const location = useLocation();

  // 1. Check if user is logged in
  if (!user) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log("Current User Role:", user.role); 
  console.log("Allowed Roles:", allowedRoles);

  const userRole = user.role?.toLowerCase();
  const allowed = allowedRoles.map(r => r.toLowerCase());

  // 2. Check for specific roles (e.g., if a Patient tries to access Admin pages)
  if (allowedRoles && !allowed.includes(userRole)) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  // 3. If all checks pass, render the child routes (The Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;