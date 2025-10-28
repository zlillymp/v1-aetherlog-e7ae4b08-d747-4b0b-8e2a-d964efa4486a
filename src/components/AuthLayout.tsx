import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useIsAuthenticated } from '@/lib/auth';
export function AuthLayout() {
  const isAuthenticated = useIsAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}