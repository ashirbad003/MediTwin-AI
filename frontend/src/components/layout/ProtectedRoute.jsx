import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { getAccessToken, getUser } from '../../utils/auth';

export default function ProtectedRoute({ allowedRoles }) {
  const token = getAccessToken() || localStorage.getItem('token');
  const user = getUser();
  const role = (user?.role || localStorage.getItem('role') || '').toUpperCase();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const formattedAllowed = allowedRoles.map(r => r.toUpperCase());
    if (!formattedAllowed.includes(role)) {
      if (role === 'DOCTOR') return <Navigate to="/doctor/dashboard" replace />;
      if (role === 'PATIENT') return <Navigate to="/patient/dashboard" replace />;
      if (role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
}
