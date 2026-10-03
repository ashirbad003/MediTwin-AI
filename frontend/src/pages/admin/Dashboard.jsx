import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Building2, Users, UserCheck, Bed, Activity, AlertTriangle, 
  Package, Calendar, TrendingUp, ShieldAlert, ArrowUpRight, RefreshCw, 
  CheckCircle, ChevronRight, Layers, FileText
} from 'lucide-react';

import { DashboardCardsSkeleton } from '../../components/common/SkeletonLoader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/dashboard');
      setStats(res.data?.stats || res.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
      setError('Unable to load hospital administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="skeleton-shimmer" style={{ width: '320px', height: '30px', borderRadius: '8px' }} />
            <div className="skeleton-shimmer" style={{ width: '420px', height: '16px', borderRadius: '6px', marginTop: '8px' }} />
          </div>
        </div>
        <DashboardCardsSkeleton count={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card animate-fade" style={{ padding: '36px', textAlign: 'center', margin: '20px auto', maxWidth: '500px' }}>
        <AlertTriangle size={36} color="#fb7185" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Executive Overview Offline</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn-primary" style={{ margin: '0 auto' }}>
          Retry Synchronization
        </button>
      </div>
    );
  }


  const bedRate = stats?.bed_occupancy_rate || 0;
  const icuRate = stats?.icu_occupancy_rate || 0;

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Top Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Hospital Operations Command Center
            </span>
          </div>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Executive Intelligence Overview
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Real-time telemetry across clinical staffing, inpatient bed capacity, critical care, and supply chain logistics.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchDashboard}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={16} /> Sync Live Data
          </button>
          <Link
            to="/admin/analytics"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 18px', background: 'var(--primary)', color: '#fff', borderRadius: 'var(--radius-md)', fontWeight: 700, textDecoration: 'none', boxShadow: 'var(--shadow-primary)' }}
          >
            <TrendingUp size={16} /> View Forecasting
          </Link>
        </div>
      </div>

      {/* Critical Operational KPI Grid */}
      <div className="grid-responsive-4" style={{ marginBottom: '28px' }}>
        {/* Total Patients */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Patients</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--primary-light)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            {stats?.total_patients || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
            <span>Active digital twin cohorts</span>
          </div>
        </div>

        {/* Medical Staff */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Attending Physicians</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--cyan-light)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>
            {stats?.total_doctors || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Across {stats?.departments?.length || 4} specialty departments
          </div>
        </div>

        {/* Bed Occupancy */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Inpatient Bed Occupancy</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--amber-light)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bed size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {stats?.occupied_beds || 0}
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              / {stats?.total_beds || 0} ({bedRate}%)
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(bedRate, 100)}%`, height: '100%', background: bedRate > 85 ? '#fb7185' : '#fbbf24' }} />
          </div>
        </div>

        {/* ICU Utilization */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>ICU Critical Capacity</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'var(--rose-light)', color: '#fb7185', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Activity size={20} />
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: '#fff' }}>
              {stats?.occupied_icu || 0}
            </span>
            <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)' }}>
              / {stats?.total_icu || 0} ({icuRate}%)
            </span>
          </div>
          {/* Progress bar */}
          <div style={{ height: '6px', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${Math.min(icuRate, 100)}%`, height: '100%', background: icuRate > 80 ? '#fb7185' : '#34d399' }} />
          </div>
        </div>

        {/* Inventory Stock Alerts */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Low Stock Items</span>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: stats?.low_inventory_count > 0 ? 'var(--rose-light)' : 'var(--emerald-light)', color: stats?.low_inventory_count > 0 ? '#fb7185' : '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={20} />
            </div>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: stats?.low_inventory_count > 0 ? '#fb7185' : '#34d399', marginBottom: '4px' }}>
            {stats?.low_inventory_count || 0}
          </div>
          <div style={{ fontSize: '0.8rem', color: stats?.low_inventory_count > 0 ? '#fb7185' : '#34d399', fontWeight: 600 }}>
            {stats?.low_inventory_count > 0 ? 'Requires immediate procurement' : 'All critical items optimal'}
          </div>
        </div>
      </div>

      {/* Middle Grid: Departments & Quick Operational Links */}
      <div className="grid-responsive-2-1" style={{ marginBottom: '28px' }}>
        {/* Department Workloads */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--primary)" /> Specialty Departments & Clinical Units
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {(stats?.departments || []).map((dept) => (
              <div 
                key={dept.id}
                style={{ 
                  background: 'var(--bg-subtle)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-md)', 
                  padding: '16px' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {dept.name}
                  </h4>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                    {dept.code}
                  </span>
                </div>
                <p style={{ margin: '0 0 12px 0', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {dept.description || 'Clinical specialty wing'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '8px' }}>
                  <span>Head: <strong>{dept.head_of_department || 'Assigned Lead'}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Command Navigation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 16px 0' }}>
              Operational Modules
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link 
                to="/admin/beds" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Bed size={18} color="var(--primary)" />
                  <span>Bed & Ward Allocation</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>

              <Link 
                to="/admin/inventory" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Package size={18} color="var(--primary)" />
                  <span>Pharmacy & Supply Stock</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>

              <Link 
                to="/admin/staff" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <UserCheck size={18} color="var(--primary)" />
                  <span>Staff & User Governance</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>

              <Link 
                to="/admin/audit-logs" 
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-main)', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldAlert size={18} color="var(--primary)" />
                  <span>Security & Audit Trail</span>
                </div>
                <ChevronRight size={16} color="var(--text-muted)" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}