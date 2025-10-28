import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthUser } from '@/lib/auth';
export function AdminLayout() {
  const user = useAuthUser();
  if (user?.role !== 'admin') {
    // Redirect non-admin users to the home page
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}