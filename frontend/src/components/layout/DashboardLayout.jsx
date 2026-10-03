import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import MobileBottomNav from './MobileBottomNav';
import ConnectionStatus from '../ConnectionStatus';
import PWAInstallPrompt from '../PWAInstallPrompt';
import ClinicalDisclaimer from '../common/ClinicalDisclaimer';
import ErrorBoundary from '../common/ErrorBoundary';
import { getUser } from '../../utils/auth';

export default function DashboardLayout({ role }) {
  const user = getUser();
  const userRole = role || (user?.role || localStorage.getItem('role') || 'DOCTOR').toUpperCase();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-main)' }}>
      {/* Offline / Online Connection Status Banner */}
      <ConnectionStatus />

      {/* Top Navbar */}
      <Navbar role={userRole} />

      {/* Main Workspace Layout */}
      <div style={{ display: 'flex', flex: 1, position: 'relative' }}>
        {/* Role-Specific Sidebar for Desktop */}
        <Sidebar role={userRole} />

        {/* Dynamic Route Content */}
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-main)', minHeight: 'calc(100vh - 68px)', padding: '24px 28px', display: 'flex', flexDirection: 'column' }}>
          <ErrorBoundary>
            <div style={{ flex: 1 }}>
              <Outlet />
            </div>
            <ClinicalDisclaimer compact />
          </ErrorBoundary>
        </main>
      </div>

      {/* Role-Aware Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Install Invitation Banner */}
      <PWAInstallPrompt />
    </div>
  );
}

