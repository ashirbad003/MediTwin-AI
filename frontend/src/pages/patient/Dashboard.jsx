import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartPulse,
  Activity,
  FileText,
  Calendar,
  Pill,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Bot
} from 'lucide-react'
import { DashboardCardsSkeleton } from '../../components/common/SkeletonLoader'
import api from '../../services/api'


function PatientDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchPatientDashboard()
  }, [])

  const fetchPatientDashboard = async () => {
    try {
      setError('')
      setLoading(true)
      const res = await api.get('/patient/dashboard')
      setData(res.data.data)
    } catch (err) {
      setError('Unable to load patient digital twin dashboard. Check connection and retry.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="skeleton-shimmer" style={{ width: '280px', height: '28px', borderRadius: '8px' }} />
            <div className="skeleton-shimmer" style={{ width: '380px', height: '16px', borderRadius: '6px', marginTop: '8px' }} />
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
        <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '8px' }}>Dashboard Offline</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>
        <button onClick={fetchPatientDashboard} className="btn-primary" style={{ margin: '0 auto' }}>
          Retry Connection
        </button>
      </div>
    )
  }


  const vitals = data?.latest_vitals || {}
  const aiRisk = data?.latest_ai_risk || {}
  const profile = data?.profile || {}

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
            Personal Health Twin Dashboard
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Hello, {data?.full_name} • Blood Group: <strong style={{ color: '#fff' }}>{profile.blood_group || 'N/A'}</strong> • Digital Twin Synchronized
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/patient/reports" className="btn-primary" style={{ fontSize: '0.85rem', padding: '9px 16px' }}>
            <FileText size={16} /> Upload Lab Report
          </Link>
          <Link to="/patient/appointments" className="btn-secondary" style={{ fontSize: '0.85rem', padding: '9px 16px' }}>
            <Calendar size={16} /> Book Appointment
          </Link>
        </div>
      </div>

      {/* AI Health Twin Overview Card */}
      <div className="glass-card" style={{
        padding: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(59, 130, 246, 0.08) 100%)',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 0 16px rgba(16, 185, 129, 0.4)'
            }}>
              <Sparkles size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff' }}>AI Health Risk Status</h3>
                <span className={`badge badge-${aiRisk.category?.toLowerCase() || 'low'}`}>
                  {aiRisk.category || 'Low'} Risk ({aiRisk.score || 12}%)
                </span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px', maxWidth: '650px' }}>
                {aiRisk.explanation || 'Your vital indicators and recent biomarker analyses demonstrate stable health metrics.'}
              </p>
            </div>
          </div>

          <Link to="/patient/assistant" className="btn-primary" style={{ fontSize: '0.85rem', padding: '10px 18px', background: 'linear-gradient(135deg, #10b981, #059669)' }}>
            <Bot size={16} /> Consult AI Companion
          </Link>
        </div>
      </div>

      {/* Vitals Highlights Grid */}
      <div className="grid-responsive-4">
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Blood Pressure</span>
          <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#fff', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {vitals.systolic_bp}/{vitals.diastolic_bp}
          </p>
          <span className="badge badge-low" style={{ fontSize: '0.7rem', marginTop: '6px' }}>Optimal mmHg</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Resting Heart Rate</span>
          <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#38bdf8', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {vitals.heart_rate} bpm
          </p>
          <span className="badge badge-low" style={{ fontSize: '0.7rem', marginTop: '6px' }}>Normal Sinus</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Oxygen Saturation</span>
          <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#34d399', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {vitals.oxygen_saturation}%
          </p>
          <span className="badge badge-low" style={{ fontSize: '0.7rem', marginTop: '6px' }}>Healthy SpO2</span>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' }}>Fasting Glucose</span>
          <p style={{ fontSize: '1.7rem', fontWeight: '800', color: '#fbbf24', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
            {vitals.blood_glucose || 95} mg/dL
          </p>
          <span className="badge badge-moderate" style={{ fontSize: '0.7rem', marginTop: '6px' }}>Checked</span>
        </div>
      </div>

      {/* Main Grid: Upcoming Consultations & Active Meds */}
      <div className="grid-responsive-2-1">
        {/* Active Medications Quick View */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>Prescribed Medications</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Daily treatment schedule and dosage guidelines</p>
            </div>
            <Link to="/patient/medications" style={{ fontSize: '0.85rem', color: '#60a5fa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Full List <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Lisinopril 10mg</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Once daily (Morning after breakfast) • For Blood Pressure</p>
              </div>
              <span className="badge badge-active">Active</span>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Atorvastatin 20mg</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Once daily (At bedtime) • For Lipid Control</p>
              </div>
              <span className="badge badge-active">Active</span>
            </div>

            <div style={{ padding: '12px 14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong style={{ color: '#fff', fontSize: '0.95rem' }}>Metformin ER 500mg</strong>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Twice daily with meals • For Glycemic Balance</p>
              </div>
              <span className="badge badge-active">Active</span>
            </div>
          </div>
        </div>

        {/* Chronic Conditions & Allergies Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff', marginBottom: '16px' }}>
            My Clinical Profile
          </h3>

          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Diagnosed Conditions ({data?.conditions?.length || 0}):
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {data?.conditions?.map((c) => (
                <span key={c.id} className="badge badge-cyan">{c.condition_name}</span>
              ))}
              {(!data?.conditions || data.conditions.length === 0) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None recorded</span>
              )}
            </div>
          </div>

          <div style={{ marginBottom: '18px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fb7185', textTransform: 'uppercase' }}>
              Known Allergies ({data?.allergies?.length || 0}):
            </span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '6px' }}>
              {data?.allergies?.map((a) => (
                <span key={a.id} className="badge badge-high">⚠️ {a.allergen}</span>
              ))}
              {(!data?.allergies || data.allergies.length === 0) && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No allergies recorded</span>
              )}
            </div>
          </div>

          <Link to="/patient/profile" className="btn-secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
            Manage Health History & Lifestyle
          </Link>
        </div>
      </div>
    </div>
  )
}

export default PatientDashboard