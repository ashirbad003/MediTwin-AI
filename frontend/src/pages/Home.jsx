import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Activity, 
  BrainCircuit, 
  HeartPulse, 
  Stethoscope, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Boxes, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Pill
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { setAuthData } from '../utils/auth'
import api from '../services/api'

function Home() {
  const navigate = useNavigate()

  const handleQuickDemoLogin = async (email, role) => {
    try {
      const res = await api.post('/auth/login', {
        email: email,
        password: 'Password123!'
      })
      const { access_token, refresh_token, user } = res.data
      setAuthData(access_token, refresh_token, user)
      navigate(`/${user.role}/dashboard`)
    } catch (err) {
      navigate('/login')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* Hero Section */}
      <section style={{
        padding: '70px 24px 60px 24px',
        textAlign: 'center',
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          <Sparkles size={16} /> B.Tech Major Project • Intelligent Healthcare Platform
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: '800',
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          maxWidth: '920px',
          background: 'linear-gradient(180deg, #ffffff 0%, #cbd5e1 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          AI-Powered Explainable Multimodal Healthcare & Hospital Intelligence
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          maxWidth: '740px',
          lineHeight: 1.6
        }}>
          Unifying <strong>Patient Digital Twins</strong>, <strong>Explainable Clinical Decision Support (XAI)</strong>, 
          <strong> Medical Document Intelligence</strong>, <strong>Medical RAG Engine</strong>, and 
          <strong> Smart Hospital Resource Forecasting</strong>.
        </p>

        {/* Quick Demo Access Bar */}
        <div className="glass-card" style={{
          marginTop: '16px',
          padding: '24px',
          width: '100%',
          maxWidth: '840px',
          border: '1px solid rgba(59, 130, 246, 0.25)',
          background: 'rgba(18, 24, 38, 0.95)'
        }}>
          <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '16px' }}>
            ⚡ Instant Role-Based Demo Portals (One-Click Login)
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <button
              onClick={() => handleQuickDemoLogin('doctor.sharma@meditwin.ai', 'doctor')}
              className="glass-card glass-card-interactive"
              style={{
                padding: '16px',
                textAlign: 'left',
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                cursor: 'pointer',
                color: '#fff',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Stethoscope size={20} color="#60a5fa" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Doctor Portal</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Dr. Rajesh Sharma (Cardiology) • CDS, RAG & Prescriptions
              </p>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('john.miller@example.com', 'patient')}
              className="glass-card glass-card-interactive"
              style={{
                padding: '16px',
                textAlign: 'left',
                background: 'rgba(16, 185, 129, 0.08)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                cursor: 'pointer',
                color: '#fff',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <HeartPulse size={20} color="#34d399" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Patient Twin</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Johnathan Miller • Lab Parser, Vitals & Health Companion
              </p>
            </button>

            <button
              onClick={() => handleQuickDemoLogin('admin@meditwin.ai', 'admin')}
              className="glass-card glass-card-interactive"
              style={{
                padding: '16px',
                textAlign: 'left',
                background: 'rgba(244, 63, 94, 0.08)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                cursor: 'pointer',
                color: '#fff',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <ShieldCheck size={20} color="#fb7185" />
                <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>Hospital Admin</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Hospital Administrator • Bed & ICU Analytics, Inventory
              </p>
            </button>
          </div>
        </div>
      </section>

      {/* Core Platform Modules */}
      <section style={{
        padding: '30px 24px 60px 24px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: '800', marginBottom: '8px' }}>
            Comprehensive Intelligence Architecture
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Engineered with transparent algorithms, clinical evidence grounding, and operational forecasting.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Card 1 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', marginBottom: '16px' }}>
              <BrainCircuit size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Explainable AI (XAI) Risk Engine</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Gradient Boosting ML models for 10-year CVD risk, Royal College of Physicians NEWS2 early warning physiological score, and 30-day readmission prediction with granular feature attribution.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399', marginBottom: '16px' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Medical Knowledge RAG Engine</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Vector-retrieved clinical practice guidelines (ACC/AHA, ADA, KDIGO, BNF monographs) with grounded citations, relevance metrics, and dual-mode clinical reasoning for physicians and patients.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fbbf24', marginBottom: '16px' }}>
              <FileText size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Medical Document Intelligence</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Automated PDF & lab report ingestion, structured biomarker extraction, reference range delta analysis, and generation of separate technical physician summaries and patient-friendly explanations.
            </p>
          </div>

          {/* Card 4 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f87171', marginBottom: '16px' }}>
              <Pill size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Prescription Intelligence</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Real-time pairwise drug-drug interaction validation, severity classification, clinical mechanism explanation, and patient-specific allergy cross-reactivity warning alerts.
            </p>
          </div>

          {/* Card 5 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22d3ee', marginBottom: '16px' }}>
              <TrendingUp size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Hospital Operational Analytics</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Time-series forecasting for bed occupancy, ICU demand, ventilator utilization, and critical pharmaceutical inventory stock depletion with confidence bands.
            </p>
          </div>

          {/* Card 6 */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', marginBottom: '16px' }}>
              <HeartPulse size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px' }}>Patient 360° Digital Twin</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Continuous vitals tracking timeline, chronic disease and allergy registry, longitudinal lab trajectory, active medication schedule, and conversational health guidance.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        marginTop: 'auto',
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.82rem'
      }}>
        <p>MediTwin-AI • Explainable Multimodal Healthcare Platform • Built for Academic & Clinical Research</p>
      </footer>
    </div>
  )
}

export default Home