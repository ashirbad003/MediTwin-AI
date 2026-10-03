import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Search, Filter, ArrowRight, Activity, AlertTriangle, ShieldCheck, HeartPulse } from 'lucide-react'
import api from '../../services/api'

function Patients() {
  const [patients, setPatients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRisk, setFilterRisk] = useState('ALL')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatients()
  }, [])

  const fetchPatients = async () => {
    try {
      setLoading(true)
      const res = await api.get('/doctor/patients')
      setPatients(res.data.patients || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = patients.filter((p) => {
    const nameMatch = (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (p.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const phoneMatch = (p.phone || '').includes(searchTerm);
    const matchesSearch = nameMatch || emailMatch || phoneMatch;
    const matchesRisk = filterRisk === 'ALL' || (p.risk_category || '').toUpperCase() === filterRisk;
    return matchesSearch && matchesRisk;
  })

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>Patient Digital Twin Registry</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Comprehensive directory of patient profiles with active clinical biomarkers and risk categories.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ padding: '16px 20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
          <input
            type="text"
            className="input-field"
            placeholder="Search by patient name, email, or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px' }}
          />
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Filter size={16} color="var(--text-muted)" />
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Risk Filter:</span>
          {['ALL', 'LOW', 'MODERATE', 'HIGH'].map((level) => (
            <button
              key={level}
              onClick={() => setFilterRisk(level)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: filterRisk === level ? '1px solid #3b82f6' : '1px solid var(--border-subtle)',
                background: filterRisk === level ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: filterRisk === level ? '#60a5fa' : 'var(--text-secondary)',
                fontSize: '0.8rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Cards Grid */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Activity className="pulse-indicator" size={32} color="#3b82f6" style={{ margin: '0 auto 12px auto' }} />
          <p>Loading patient registry...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Users size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <p>No patients matching the specified criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
          {filtered.map((pat) => (
            <div key={pat.patient_id} className="glass-card glass-card-interactive" style={{ padding: '22px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{pat.full_name}</h3>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ID #{pat.patient_id} • {pat.gender || 'Unknown'} • Blood: {pat.blood_group}</p>
                </div>
                <span className={`badge badge-${pat.risk_category.toLowerCase()}`}>
                  {pat.risk_score}% {pat.risk_category}
                </span>
              </div>

              {/* Vitals snippet */}
              <div style={{
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)',
                marginBottom: '14px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '8px',
                fontSize: '0.8rem'
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Blood Pressure:</span>
                  <p style={{ fontWeight: '600', color: '#fff', fontFamily: 'var(--font-mono)' }}>{pat.vitals.bp} mmHg</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Heart Rate:</span>
                  <p style={{ fontWeight: '600', color: '#fff', fontFamily: 'var(--font-mono)' }}>{pat.vitals.hr} bpm</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Oxygen (SpO2):</span>
                  <p style={{ fontWeight: '600', color: '#34d399', fontFamily: 'var(--font-mono)' }}>{pat.vitals.spo2}%</p>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Temperature:</span>
                  <p style={{ fontWeight: '600', color: '#fff', fontFamily: 'var(--font-mono)' }}>{pat.vitals.temp} °C</p>
                </div>
              </div>

              {/* Conditions & Allergies Tags */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Clinical Registry:</p>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {pat.conditions.map((c, i) => (
                    <span key={i} className="badge badge-cyan" style={{ fontSize: '0.68rem' }}>{c}</span>
                  ))}
                  {pat.allergies.map((a, i) => (
                    <span key={i} className="badge badge-high" style={{ fontSize: '0.68rem' }}>Allergy: {a}</span>
                  ))}
                  {pat.conditions.length === 0 && pat.allergies.length === 0 && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No chronic conditions logged.</span>
                  )}
                </div>
              </div>

              {/* View Digital Twin button */}
              <Link
                to={`/doctor/patients/${pat.patient_id}`}
                className="btn-primary"
                style={{ width: '100%', padding: '9px 14px', fontSize: '0.85rem' }}
              >
                Inspect 360° Digital Twin <ArrowRight size={15} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Patients
