// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../utils/Cookie';

const ProtectedRoute = () => {
  const location = useLocation();
  
  if (!isAuthenticated()) {
    // Redirect to the login page with the return url
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

export default ProtectedRoute;
