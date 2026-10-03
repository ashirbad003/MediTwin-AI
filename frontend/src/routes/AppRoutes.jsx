import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Security
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import { DashboardCardsSkeleton } from '../components/common/SkeletonLoader';

// Public & Auth Pages (Eagerly loaded for fast landing/auth transitions)
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Doctor Pages (Lazy Loaded)
const DoctorDashboard = lazy(() => import('../pages/doctor/Dashboard'));
const DoctorPatients = lazy(() => import('../pages/doctor/Patients'));
const DoctorPatientDetail = lazy(() => import('../pages/doctor/PatientDetail'));
const DoctorClinicalAI = lazy(() => import('../pages/doctor/ClinicalAI'));
const DoctorPrescriptionManager = lazy(() => import('../pages/doctor/PrescriptionManager'));
const DoctorAppointments = lazy(() => import('../pages/doctor/Appointments'));
const DoctorProfile = lazy(() => import('../pages/doctor/Profile'));

// Patient Pages (Lazy Loaded)
const PatientDashboard = lazy(() => import('../pages/patient/Dashboard'));
const PatientReports = lazy(() => import('../pages/patient/Reports'));
const PatientAppointments = lazy(() => import('../pages/patient/Appointments'));
const PatientMedications = lazy(() => import('../pages/patient/Medications'));
const PatientHealthAssistant = lazy(() => import('../pages/patient/HealthAssistant'));
const PatientProfile = lazy(() => import('../pages/patient/Profile'));

// Admin Pages (Lazy Loaded)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
const AdminBedManagement = lazy(() => import('../pages/admin/BedManagement'));
const AdminInventory = lazy(() => import('../pages/admin/Inventory'));
const AdminStaffManagement = lazy(() => import('../pages/admin/StaffManagement'));
const AdminAnalytics = lazy(() => import('../pages/admin/Analytics'));
const AdminAuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const AdminProfile = lazy(() => import('../pages/admin/Profile'));

function RouteFallback() {
  return (
    <div className="animate-fade" style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <DashboardCardsSkeleton count={4} />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Doctor Protected Subsystem */}
        <Route element={<ProtectedRoute allowedRoles={['DOCTOR']} />}>
          <Route element={<DashboardLayout role="DOCTOR" />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} />
            <Route path="/doctor/clinical-ai" element={<DoctorClinicalAI />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptionManager />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>
        </Route>

        {/* Patient Protected Subsystem */}
        <Route element={<ProtectedRoute allowedRoles={['PATIENT']} />}>
          <Route element={<DashboardLayout role="PATIENT" />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/reports" element={<PatientReports />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/medications" element={<PatientMedications />} />
            <Route path="/patient/health-assistant" element={<PatientHealthAssistant />} />
            <Route path="/patient/assistant" element={<PatientHealthAssistant />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
          </Route>
        </Route>

        {/* Admin Protected Subsystem */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route element={<DashboardLayout role="ADMIN" />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/beds" element={<AdminBedManagement />} />
            <Route path="/admin/inventory" element={<AdminInventory />} />
            <Route path="/admin/staff" element={<AdminStaffManagement />} />
            <Route path="/admin/users" element={<AdminStaffManagement />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />
            <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}