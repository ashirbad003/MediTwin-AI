import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  ShieldAlert, Clock, User, Search, RefreshCw, 
  CheckCircle, AlertTriangle, Filter, Lock, Key, Activity
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      const list = res.data?.logs || (Array.isArray(res.data) ? res.data : []);
      setLogs(list);
    } catch (err) {
      console.error('Failed to load audit logs', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.action && log.action.toLowerCase().includes(search.toLowerCase())) ||
                          (log.user_email && log.user_email.toLowerCase().includes(search.toLowerCase())) ||
                          (log.details && JSON.stringify(log.details).toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;
    if (categoryFilter === 'ALL') return true;
    return log.action?.toUpperCase().includes(categoryFilter);
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Security, HIPAA & Clinical Traceability
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Hospital Audit Trail & Compliance Ledger
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Immutable immutable records of AI inferences, electronic health record access, pharmacotherapy orders, and administrative state changes.
          </p>
        </div>

        <button 
          onClick={fetchLogs}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={16} /> Refresh Log Stream
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', width: '340px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search action, email, or details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'All Events' },
            { id: 'LOGIN', label: 'Authentication' },
            { id: 'PRESCRIPTION', label: 'Prescriptions' },
            { id: 'AI', label: 'AI Inferences' },
            { id: 'REPORT', label: 'Reports' }
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              style={{
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: categoryFilter === c.id ? 'var(--primary)' : 'var(--bg-card)',
                color: categoryFilter === c.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
                border: '1px solid var(--border)'
              }}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Streaming audit logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <ShieldAlert size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>No matching audit records</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Actions performed by users and AI models are recorded here automatically.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Timestamp</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Actor / User</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Action Performed</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Resource / Target</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>IP / Client</th>
                  <th style={{ padding: '14px 18px', fontWeight: 700 }}>Telemetry Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log, idx) => {
                  const isAuth = log.action?.includes('LOGIN') || log.action?.includes('AUTH');
                  const isAi = log.action?.includes('AI') || log.action?.includes('PREDICT');
                  const isRx = log.action?.includes('PRESCRIPTION');

                  return (
                    <tr key={log.id || idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                        {new Date(log.created_at).toLocaleString()}
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                          {log.user_email || `User #${log.user_id || 'System'}`}
                        </div>
                      </td>

                      <td style={{ padding: '14px 18px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                          background: isAuth ? '#eff6ff' : isAi ? '#fdf4ff' : isRx ? '#ecfdf5' : 'var(--bg-card)',
                          color: isAuth ? '#2563eb' : isAi ? '#9333ea' : isRx ? '#059669' : 'var(--text-main)',
                          border: `1px solid ${isAuth ? '#bfdbfe' : isAi ? '#f0abfc' : isRx ? '#a7f3d0' : 'var(--border)'}`
                        }}>
                          {log.action}
                        </span>
                      </td>

                      <td style={{ padding: '14px 18px', color: 'var(--text-secondary)' }}>
                        {log.resource_type ? `${log.resource_type} #${log.resource_id || ''}` : 'Hospital System'}
                      </td>

                      <td style={{ padding: '14px 18px', color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                        {log.ip_address || '127.0.0.1'}
                      </td>

                      <td style={{ padding: '14px 18px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {log.details ? (
                          typeof log.details === 'object' 
                            ? JSON.stringify(log.details) 
                            : String(log.details)
                        ) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
