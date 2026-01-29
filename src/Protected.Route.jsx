// src/ERP/Components/Auth/ProtectedRoute.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { getToken } from "@/API/token";

const ProtectedRoute = () => {
  const token = getToken();

  if (!token) {
    // User is logged out → redirect to login page
    return <Navigate to="/erp/auth/login" replace />;
  }

  // User is logged in → allow access
  return <Outlet />;
};

export default ProtectedRoute;
