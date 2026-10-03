import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  AlertTriangle,
  FileText,
  Activity,
  BrainCircuit,
  Pill,
  ArrowRight,
  TrendingUp,
  Stethoscope,
  Clock,
  ChevronRight,
  ShieldAlert
} from 'lucide-react'
import api from '../../services/api'

import { DashboardCardsSkeleton } from '../../components/common/SkeletonLoader'

function DoctorDashboard() {
  const [data, setData] = useState(null)
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setError('')
      setLoading(true)
      const [dashRes, patRes] = await Promise.all([
        api.get('/doctor/dashboard'),
        api.get('/doctor/patients')
      ])
      setData(dashRes.data)
      setPatients(patRes.data.patients || [])
    } catch (err) {
      setError('Unable to load doctor clinical dashboard data. Please verify network and backend status.')
    } finally {
      setLoading(false)
    }
  }

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
    )
  }

  if (error) {
    return (
      <div className="glass-card animate-fade" style={{ padding: '36px', textAlign: 'center', margin: '20px auto', maxWidth: '500px' }}>
        <AlertTriangle size={36} color="#fb7185" style={{ margin: '0 auto 12px' }} />
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Clinical Dashboard Offline</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchDashboard} className="btn-primary" style={{ margin: '0 auto' }}>
          Retry Connection
        </button>
      </div>
    )
  }


  const kpis = data?.kpis || {}
  const highRiskPatients = patients.filter(p => p.risk_category === 'High' || p.risk_category === 'Moderate')

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Welcome Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#fff' }}>
            Clinical Decision Support Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Welcome back, {data?.user?.full_name} • {kpis?.doctor_profile?.specialization || 'Consultant Physician'} ({kpis?.doctor_profile?.department || 'Internal Medicine'})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/doctor/clinical-ai" className="btn-primary" style={{ fontSize: '0.85rem', padding: '9px 16px' }}>
            <BrainCircuit size={16} /> Clinical AI & RAG
          </Link>
          <Link to="/doctor/prescriptions" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '9px 16px' }}>
            <Pill size={16} /> New Prescription
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid-responsive-4">
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assigned Patients</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
              <Users size={18} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{kpis.total_assigned_patients || patients.length}</p>
          <p style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} /> Active Digital Twins
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Today's Consultations</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
              <Calendar size={18} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{kpis.today_appointments_count || 2}</p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '8px' }}>
            Next: 10:30 AM (Cardiology Follow-up)
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>High Risk Alerts</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(244, 63, 94, 0.15)', color: '#fb7185' }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#fb7185', lineHeight: 1 }}>{highRiskPatients.length}</p>
          <p style={{ fontSize: '0.78rem', color: '#fb7185', marginTop: '8px' }}>
            Requires clinical attention
          </p>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Lab Reports Pending</span>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
              <FileText size={18} />
            </div>
          </div>
          <p style={{ fontSize: '2rem', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{kpis.recent_reports_count || 1}</p>
          <p style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '8px' }}>
            AI Analyzed & Structured
          </p>
        </div>
      </div>

      {/* Main Grid: Patients Directory & CDS Highlights */}
      <div className="grid-responsive-2-1">
        {/* Patients Active Watchlist */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>Patient Clinical Registry</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live vitals and machine learning risk stratification</p>
            </div>
            <Link to="/doctor/patients" style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={16} />
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Age / Gender</th>
                  <th>Latest Vitals (BP / HR)</th>
                  <th>Active Conditions</th>
                  <th>AI Risk Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.slice(0, 5).map((pat) => (
                  <tr key={pat.patient_id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: '600', color: '#fff' }}>{pat.full_name}</span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID #{pat.patient_id} • Blood: {pat.blood_group}</p>
                      </div>
                    </td>
                    <td>{pat.gender || 'N/A'}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                        {pat.vitals.bp} mmHg • {pat.vitals.hr} bpm
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {pat.conditions.length > 0 ? (
                          pat.conditions.map((c, i) => (
                            <span key={i} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                              {c}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>None noted</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge-${pat.risk_category.toLowerCase()}`}>
                        {pat.risk_score}% ({pat.risk_category})
                      </span>
                    </td>
                    <td>
                      <Link 
                        to={`/doctor/patients/${pat.patient_id}`}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '8px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: '#60a5fa',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Digital Twin <ArrowRight size={13} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Clinical AI Tools */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                <BrainCircuit size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Clinical Decision Support</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Ask clinical guidelines, calculate NEWS2 early warning deterioration scores, or run Explainable AI models.
            </p>
            <Link to="/doctor/clinical-ai" className="btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Launch Clinical AI Suite
            </Link>
          </div>

          <div className="glass-card" style={{ padding: '20px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}>
                <Pill size={20} />
              </div>
              <h4 style={{ fontSize: '1rem', fontWeight: '700' }}>Drug Interaction Engine</h4>
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
              Validate multi-drug regimens pairwise against pharmacological monographs and patient allergy cross-reactivities.
            </p>
            <Link to="/doctor/prescriptions" className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Open Prescription Manager
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard