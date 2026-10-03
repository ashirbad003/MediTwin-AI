import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, getUser } from '../utils/auth'

function ProtectedRoute({ allowedRoles = [] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />
  }

  const user = getUser()
  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect to user's assigned dashboard
    const fallback = user?.role ? `/${user.role}/dashboard` : '/'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}

export default ProtectedRoute
