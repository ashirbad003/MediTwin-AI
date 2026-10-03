import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BrainCircuit,
  FileText,
  Calendar,
  Pill,
  BedDouble,
  ShieldAlert,
  BarChart3,
  Bot,
  User,
  HeartPulse,
  Syringe,
  Boxes,
  ScrollText,
  Activity
} from 'lucide-react'
import { getUser } from '../utils/auth'

function Sidebar() {
  const user = getUser()
  const role = user?.role || 'patient'
  const location = useLocation()

  const getLinks = () => {
    switch (role) {
      case 'doctor':
        return [
          { to: '/doctor/dashboard', label: 'Clinical Overview', icon: <LayoutDashboard size={18} /> },
          { to: '/doctor/patients', label: 'Patient Digital Twins', icon: <Users size={18} /> },
          { to: '/doctor/clinical-ai', label: 'Clinical AI & RAG', icon: <BrainCircuit size={18} /> },
          { to: '/doctor/prescriptions', label: 'Smart Prescriptions', icon: <Pill size={18} /> },
          { to: '/doctor/appointments', label: 'Appointments', icon: <Calendar size={18} /> },
          { to: '/doctor/profile', label: 'Physician Credentials', icon: <User size={18} /> }
        ]
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Hospital Overview', icon: <LayoutDashboard size={18} /> },
          { to: '/admin/beds', label: 'Bed & Ward Control', icon: <BedDouble size={18} /> },
          { to: '/admin/inventory', label: 'Medicine & Supplies', icon: <Boxes size={18} /> },
          { to: '/admin/users', label: 'Staff & Access Management', icon: <Users size={18} /> },
          { to: '/admin/analytics', label: 'Demand Forecasting', icon: <BarChart3 size={18} /> },
          { to: '/admin/audit-logs', label: 'Compliance Audit Logs', icon: <ScrollText size={18} /> }
        ]
      default:
        return [
          { to: '/patient/dashboard', label: 'My Health Twin', icon: <HeartPulse size={18} /> },
          { to: '/patient/reports', label: 'Reports & Lab AI', icon: <FileText size={18} /> },
          { to: '/patient/appointments', label: 'Appointments', icon: <Calendar size={18} /> },
          { to: '/patient/medications', label: 'Active Medications', icon: <Pill size={18} /> },
          { to: '/patient/assistant', label: 'Health AI Assistant', icon: <Bot size={18} /> },
          { to: '/patient/profile', label: 'Personal & Vitals', icon: <User size={18} /> }
        ]
    }
  }

  const links = getLinks()

  return (
    <aside style={{
      width: '260px',
      minHeight: 'calc(100vh - 68px)',
      background: 'rgba(11, 15, 25, 0.7)',
      borderRight: '1px solid var(--border-subtle)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    }}>
      <div style={{ padding: '0 12px 12px 12px', borderBottom: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
        <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: '700' }}>
          {role.toUpperCase()} PORTAL
        </p>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {links.map((item) => {
          const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/')
          return (
            <NavLink
              key={item.to}
              to={item.to}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '11px 14px',
                borderRadius: '10px',
                fontSize: '0.88rem',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                background: isActive ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(37, 99, 235, 0.15) 100%)' : 'transparent',
                border: isActive ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid transparent',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'
                  e.currentTarget.style.color = '#fff'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }
              }}
            >
              <span style={{ color: isActive ? '#60a5fa' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Real-time sync badge */}
      <div style={{ marginTop: 'auto', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="pulse-indicator" />
          <span style={{ fontWeight: '600', color: 'var(--text-primary)' }}>Engine Online</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
          FastAPI & PostgreSQL Synced
        </p>
      </div>
    </aside>
  )
}

export default Sidebar
