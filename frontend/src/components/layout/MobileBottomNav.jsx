import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HeartPulse,
  FileText,
  Calendar,
  Pill,
  Bot,
  User,
  LayoutDashboard,
  Users,
  BrainCircuit,
  BedDouble,
  Boxes,
  ScrollText,
  BarChart3
} from 'lucide-react';
import { getUser } from '../../utils/auth';

export default function MobileBottomNav() {
  const user = getUser();
  const rawRole = (user?.role || localStorage.getItem('role') || 'PATIENT').toLowerCase();
  const location = useLocation();

  const getMobileLinks = () => {
    switch (rawRole) {
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
          { to: '/doctor/patients', label: 'Patients', icon: <Users size={20} /> },
          { to: '/doctor/clinical-ai', label: 'AI & RAG', icon: <BrainCircuit size={20} /> },
          { to: '/doctor/prescriptions', label: 'Rx', icon: <Pill size={20} /> },
          { to: '/doctor/appointments', label: 'Calendar', icon: <Calendar size={20} /> }
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Overview', icon: <LayoutDashboard size={20} /> },
          { to: '/admin/beds', label: 'Beds', icon: <BedDouble size={20} /> },
          { to: '/admin/inventory', label: 'Stock', icon: <Boxes size={20} /> },
          { to: '/admin/analytics', label: 'Forecast', icon: <BarChart3 size={20} /> },
          { to: '/admin/audit-logs', label: 'Audit', icon: <ScrollText size={20} /> }
        ];
      default:
        return [
          { to: '/patient/dashboard', label: 'Twin', icon: <HeartPulse size={20} /> },
          { to: '/patient/reports', label: 'Reports', icon: <FileText size={20} /> },
          { to: '/patient/appointments', label: 'Visits', icon: <Calendar size={20} /> },
          { to: '/patient/medications', label: 'Meds', icon: <Pill size={20} /> },
          { to: '/patient/assistant', label: 'AI Bot', icon: <Bot size={20} /> }
        ];
    }
  };

  const links = getMobileLinks();

  return (
    <nav
      className="mobile-bottom-nav"
      aria-label="Mobile Navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(11, 15, 25, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid var(--border-subtle)',
        display: 'none', // Shown via CSS media queries @media (max-width: 768px)
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 50,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      {links.map((item) => {
        const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
        return (
          <NavLink
            key={item.to}
            to={item.to}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              padding: '6px 8px',
              color: isActive ? '#60a5fa' : 'var(--text-muted)',
              fontSize: '0.7rem',
              fontWeight: isActive ? '700' : '500',
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              minWidth: '54px',
              minHeight: '44px' // Accessibility touch target
            }}
          >
            <span style={{ transform: isActive ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s ease' }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
