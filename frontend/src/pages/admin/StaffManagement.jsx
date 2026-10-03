import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Users, UserPlus, Shield, UserCheck, Search, 
  RefreshCw, CheckCircle, AlertTriangle, Lock, Unlock, Mail, Stethoscope
} from 'lucide-react';

export default function StaffManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState(null);

  // New User Form State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'DOCTOR',
    full_name: '',
    specialization: 'Cardiology',
    department: 'Cardiology'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = !user.is_active;
    const confirmMsg = newStatus 
      ? `Activate access for ${user.email}?` 
      : `Suspend account access for ${user.email}?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.put(`/admin/users/${user.id}/status`, { is_active: newStatus });
      setMessage({ type: 'success', text: `Account ${user.email} ${newStatus ? 'activated' : 'suspended'}.` });
      fetchUsers();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to modify user status.' });
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      await api.post('/admin/users', formData);
      setMessage({ type: 'success', text: `New ${formData.role.toLowerCase()} account created successfully.` });
      setShowAddModal(false);
      setFormData({
        email: '',
        password: '',
        role: 'DOCTOR',
        full_name: '',
        specialization: 'Cardiology',
        department: 'Cardiology'
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to create user', err);
      setMessage({ type: 'error', text: err.response?.data?.detail || 'Failed to create user.' });
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.email.toLowerCase().includes(search.toLowerCase()) ||
                          (u.full_name && u.full_name.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (roleFilter === 'ALL') return true;
    return u.role?.toUpperCase() === roleFilter;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              IAM & Role-Based Access Control
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Hospital Personnel & User Directory
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Manage clinical physician credentials, patient accounts, administrative privileges, and account security.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchUsers}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}
          >
            <UserPlus size={18} /> Provision User
          </button>
        </div>
      </div>

      {message && (
        <div style={{ 
          padding: '14px 18px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', width: '320px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'DOCTOR', 'PATIENT', 'ADMIN'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: roleFilter === r ? 'var(--primary)' : 'var(--bg-card)',
                color: roleFilter === r ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                border: '1px solid var(--border)'
              }}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading staff directory...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>No matching accounts found</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Check filter parameters or provision a new user.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>User Identity</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Role</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Department / Specialty</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Account Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Joined Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Security Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, idx) => {
                  const roleUpper = u.role?.toUpperCase();
                  const isDoctor = roleUpper === 'DOCTOR';
                  const isAdmin = roleUpper === 'ADMIN';

                  return (
                    <tr key={u.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {u.full_name || u.email.split('@')[0]}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Mail size={12} /> {u.email}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '3px 10px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: isAdmin ? '#fef3c7' : isDoctor ? '#eff6ff' : '#ecfdf5',
                          color: isAdmin ? '#d97706' : isDoctor ? '#2563eb' : '#059669',
                          border: `1px solid ${isAdmin ? '#fde68a' : isDoctor ? '#bfdbfe' : '#a7f3d0'}`
                        }}>
                          {u.role}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {u.specialization ? `${u.specialization} (${u.department || 'Clinical'})` : '—'}
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {u.is_active ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#059669', fontWeight: 700, fontSize: '0.85rem' }}>
                            <CheckCircle size={14} /> Active
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#dc2626', fontWeight: 700, fontSize: '0.85rem' }}>
                            <Lock size={14} /> Suspended
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border)',
                            background: u.is_active ? '#fff1f2' : '#ecfdf5',
                            color: u.is_active ? '#e11d48' : '#059669',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {u.is_active ? <Lock size={13} /> : <Unlock size={13} />}
                          {u.is_active ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Provision User Modal */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserPlus size={20} color="var(--primary)" /> Provision New Account
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Role Permission *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                >
                  <option value="DOCTOR">Doctor / Physician</option>
                  <option value="ADMIN">Hospital Administrator</option>
                  <option value="PATIENT">Patient</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="e.g. Dr. Jennifer Vance"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Corporate / Medical Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. dr.vance@hospital.org"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Temporary Password *
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Min 8 chars"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              {formData.role === 'DOCTOR' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Specialization
                    </label>
                    <input
                      type="text"
                      value={formData.specialization}
                      onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      placeholder="e.g. Cardiology"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="e.g. Cardiology"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
