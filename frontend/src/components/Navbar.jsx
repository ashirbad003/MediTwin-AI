import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Activity, 
  Bell, 
  User as UserIcon, 
  LogOut, 
  Shield, 
  Stethoscope, 
  HeartPulse,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { getUser, clearAuthData } from '../utils/auth'

function Navbar() {
  const navigate = useNavigate()
  const user = getUser()
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleLogout = () => {
    clearAuthData()
    navigate('/login')
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'doctor':
        return { label: 'Physician', color: 'badge-info', icon: <Stethoscope size={13} /> }
      case 'admin':
        return { label: 'Admin', color: 'badge-high', icon: <Shield size={13} /> }
      default:
        return { label: 'Patient', color: 'badge-low', icon: <HeartPulse size={13} /> }
    }
  }

  const roleInfo = getRoleBadge(user?.role)

  return (
    <header style={{
      height: '68px',
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px'
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 0 16px rgba(59, 130, 246, 0.4)'
          }}>
            <Activity size={22} />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
              MEDi<span style={{ color: '#3b82f6' }}>TWIN</span><span style={{ color: '#10b981' }}>-AI</span>
            </span>
          </div>
        </Link>
        <span style={{
          fontSize: '0.75rem',
          padding: '2px 8px',
          borderRadius: '4px',
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#60a5fa',
          fontWeight: '600',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          v1.0 Core
        </span>
      </div>

      {/* Right actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {user ? (
          <>
            {/* Notification trigger */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <Bell size={18} />
                <span style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: '#3b82f6'
                }} />
              </button>

              {showNotifications && (
                <div className="glass-card animate-fade" style={{
                  position: 'absolute',
                  right: 0,
                  top: '46px',
                  width: '300px',
                  padding: '16px',
                  zIndex: 50
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>System Alerts</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Real-time</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.8rem' }}>
                      <p style={{ fontWeight: '600', color: '#60a5fa' }}>AI Twin Synchronization</p>
                      <p style={{ color: 'var(--text-secondary)' }}>Clinical intelligence engine operational.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Pill Dropdown */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '6px 14px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: '#fff'
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #2563eb, #1e40af)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  {user.full_name ? user.full_name[0] : 'U'}
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontSize: '0.85rem', fontWeight: '600', lineHeight: 1.2 }}>{user.full_name || 'User'}</p>
                  <span className={`badge ${roleInfo.color}`} style={{ padding: '1px 6px', fontSize: '0.65rem' }}>
                    {roleInfo.icon} {roleInfo.label}
                  </span>
                </div>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {showDropdown && (
                <div className="glass-card animate-fade" style={{
                  position: 'absolute',
                  right: 0,
                  top: '52px',
                  width: '200px',
                  padding: '8px',
                  zIndex: 50
                }}>
                  <Link 
                    to={`/${user.role}/profile`} 
                    onClick={() => setShowDropdown(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: 'var(--text-secondary)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <UserIcon size={16} /> My Profile
                  </Link>
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '0.85rem',
                      color: '#fb7185',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <Link to="/login" className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Sign In
            </Link>
            <Link to="/register" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              Create Account
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar
