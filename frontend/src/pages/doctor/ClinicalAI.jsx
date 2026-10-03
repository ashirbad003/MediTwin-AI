import React, { useState } from 'react'
import {
  BrainCircuit,
  Search,
  Sparkles,
  BookOpen,
  Activity,
  AlertTriangle,
  Send,
  HelpCircle,
  TrendingUp,
  HeartPulse,
  Flame,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react'
import api from '../../services/api'

function ClinicalAI() {
  const [activeModule, setActiveModule] = useState('rag') // 'rag', 'disease_risk', 'news2'

  // RAG State
  const [query, setQuery] = useState('')
  const [ragResult, setRagResult] = useState(null)
  const [ragLoading, setRagLoading] = useState(false)

  // Disease Risk ML State
  const [age, setAge] = useState(58)
  const [gender, setGender] = useState('male')
  const [systolicBp, setSystolicBp] = useState(148)
  const [diastolicBp, setDiastolicBp] = useState(92)
  const [cholesterol, setCholesterol] = useState(235)
  const [bloodGlucose, setBloodGlucose] = useState(130)
  const [bmi, setBmi] = useState(28.5)
  const [smoking, setSmoking] = useState(1)
  const [alcohol, setAlcohol] = useState(0)
  const [activity, setActivity] = useState(0)
  const [familyHistory, setFamilyHistory] = useState(1)
  const [riskResult, setRiskResult] = useState(null)
  const [riskLoading, setRiskLoading] = useState(false)

  // NEWS2 State
  const [rr, setRr] = useState(24)
  const [spo2, setSpo2] = useState(93)
  const [o2Therapy, setO2Therapy] = useState(false)
  const [sbp, setSbp] = useState(98)
  const [hr, setHr] = useState(115)
  const [consciousness, setConsciousness] = useState('Alert')
  const [temp, setTemp] = useState(38.6)
  const [newsResult, setNewsResult] = useState(null)
  const [newsLoading, setNewsLoading] = useState(false)

  const handleRAGQuery = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    try {
      setRagLoading(true)
      const res = await api.post('/rag/query', {
        query: query.trim(),
        mode: 'doctor'
      })
      setRagResult(res.data)
    } catch (err) {
      alert('Failed to query RAG engine.')
    } finally {
      setRagLoading(false)
    }
  }

  const handlePredictRisk = async (e) => {
    e.preventDefault()
    try {
      setRiskLoading(true)
      const res = await api.post('/ai/disease-risk', {
        age: parseInt(age),
        gender,
        systolic_bp: parseFloat(systolicBp),
        diastolic_bp: parseFloat(diastolicBp),
        cholesterol: parseFloat(cholesterol),
        blood_glucose: parseFloat(bloodGlucose),
        bmi: parseFloat(bmi),
        smoking: parseInt(smoking),
        alcohol_intake: parseInt(alcohol),
        physical_activity: parseInt(activity),
        family_history: parseInt(familyHistory)
      })
      setRiskResult(res.data)
    } catch (err) {
      alert('Failed to execute ML prediction.')
    } finally {
      setRiskLoading(false)
    }
  }

  const handleCalculateNews2 = async (e) => {
    e.preventDefault()
    try {
      setNewsLoading(true)
      const res = await api.post('/ai/news2', {
        respiration_rate: parseInt(rr),
        oxygen_saturation: parseInt(spo2),
        supplemental_oxygen: o2Therapy,
        systolic_bp: parseInt(sbp),
        heart_rate: parseInt(hr),
        consciousness_level: consciousness,
        temperature: parseFloat(temp)
      })
      setNewsResult(res.data)
    } catch (err) {
      alert('Failed to calculate NEWS2 score.')
    } finally {
      setNewsLoading(false)
    }
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
          Clinical AI & Explainable Intelligence Suite
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Empowering licensed clinicians with evidence-grounded RAG guidelines, machine learning risk models, and physiological early warning scoring.
        </p>
      </div>

      {/* Module Selector */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        <button
          onClick={() => setActiveModule('rag')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeModule === 'rag' ? '1px solid #3b82f6' : '1px solid transparent',
            background: activeModule === 'rag' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeModule === 'rag' ? '#60a5fa' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <BookOpen size={17} /> Medical RAG Knowledge Assistant
        </button>

        <button
          onClick={() => setActiveModule('disease_risk')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeModule === 'disease_risk' ? '1px solid #10b981' : '1px solid transparent',
            background: activeModule === 'disease_risk' ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            color: activeModule === 'disease_risk' ? '#34d399' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <HeartPulse size={17} /> ML Disease Risk & SHAP Attribution
        </button>

        <button
          onClick={() => setActiveModule('news2')}
          style={{
            padding: '10px 18px',
            borderRadius: '10px',
            border: activeModule === 'news2' ? '1px solid #f43f5e' : '1px solid transparent',
            background: activeModule === 'news2' ? 'rgba(244, 63, 94, 0.2)' : 'transparent',
            color: activeModule === 'news2' ? '#fb7185' : 'var(--text-secondary)',
            fontWeight: '600',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Flame size={17} /> NEWS2 Early Warning Calculator
        </button>
      </div>

      {/* 1. RAG ASSISTANT MODULE */}
      {activeModule === 'rag' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '8px', color: '#fff' }}>
              Query Evidence-Based Clinical Practice Guidelines
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Ask questions regarding hypertension targets, diabetes management, anticoagulation, CKD staging, or sepsis protocols.
            </p>

            <form onSubmit={handleRAGQuery} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. When is SGLT2 inhibitor recommended in type 2 diabetes with CKD?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ flex: 1, padding: '12px 16px' }}
              />
              <button type="submit" className="btn-primary" disabled={ragLoading} style={{ padding: '0 24px' }}>
                {ragLoading ? 'Retrieving...' : 'Query Guidelines'} <Send size={16} />
              </button>
            </form>

            {/* Quick Sample Queries */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Try:</span>
              {[
                'Blood pressure target in diabetes with ASCVD risk',
                'Contraindications for metformin therapy',
                'NEWS2 score escalation thresholds for sepsis'
              ].map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setQuery(sample)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid var(--border-subtle)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer'
                  }}
                >
                  "{sample}"
                </button>
              ))}
            </div>
          </div>

          {/* RAG Answer Display */}
          {ragResult && (
            <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="badge badge-info" style={{ fontSize: '0.78rem' }}>
                  <Sparkles size={14} /> Grounded Clinical Guidance
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Generated at {ragResult.generated_at}</span>
              </div>

              <div style={{ color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: '0.92rem', marginBottom: '20px' }}>
                {ragResult.answer}
              </div>

              {/* Citations Box */}
              <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.04em' }}>
                  📚 Verified Grounded Citations & Sources:
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {ragResult.grounded_citations.map((c, i) => (
                    <div key={i} style={{ padding: '10px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border-subtle)', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ color: '#fff' }}>{c.document_title}</strong>
                        <span className="badge badge-low" style={{ fontSize: '0.68rem' }}>Match: {(c.relevance_score * 100).toFixed(0)}%</span>
                      </div>
                      <p style={{ color: '#94a3b8', fontSize: '0.78rem' }}>{c.section} • Page {c.page_number}</p>
                      <p style={{ color: 'var(--text-secondary)', marginTop: '4px', fontStyle: 'italic' }}>"{c.snippet}"</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. DISEASE RISK & SHAP XAI MODULE */}
      {activeModule === 'disease_risk' && (
        <div className="grid-responsive-1-2">
          {/* Inputs Form */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
              Patient Clinical Parameters
            </h3>
            <form onSubmit={handlePredictRisk} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid-form-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Age (years)</label>
                  <input type="number" className="input-field" value={age} onChange={(e) => setAge(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Gender</label>
                  <select className="input-field" value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Systolic BP (mmHg)</label>
                  <input type="number" className="input-field" value={systolicBp} onChange={(e) => setSystolicBp(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Diastolic BP (mmHg)</label>
                  <input type="number" className="input-field" value={diastolicBp} onChange={(e) => setDiastolicBp(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total Cholesterol (mg/dL)</label>
                  <input type="number" className="input-field" value={cholesterol} onChange={(e) => setCholesterol(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Fasting Glucose (mg/dL)</label>
                  <input type="number" className="input-field" value={bloodGlucose} onChange={(e) => setBloodGlucose(e.target.value)} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>BMI (kg/m²)</label>
                  <input type="number" step="0.1" className="input-field" value={bmi} onChange={(e) => setBmi(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Smoking Status</label>
                  <select className="input-field" value={smoking} onChange={(e) => setSmoking(e.target.value)}>
                    <option value={0}>Non-Smoker</option>
                    <option value={1}>Current Smoker</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={riskLoading} style={{ marginTop: '8px' }}>
                {riskLoading ? 'Computing Model...' : 'Calculate 10-Yr CVD Risk & XAI'}
              </button>
            </form>
          </div>

          {/* Results & XAI Breakdown */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
              Explainable AI (XAI) Attribution
            </h3>

            {riskResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Estimated 10-Year Cardiovascular Event Risk</span>
                    <p style={{ fontSize: '2rem', fontWeight: '800', color: riskResult.risk_category === 'High' ? '#fb7185' : '#34d399', fontFamily: 'var(--font-mono)' }}>
                      {riskResult.risk_score_percent}%
                    </p>
                  </div>
                  <span className={`badge badge-${riskResult.risk_category.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                    {riskResult.risk_category} Risk
                  </span>
                </div>

                {/* Explanation */}
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {riskResult.explanation_summary}
                </p>

                {/* Feature Contribution Waterfall */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Feature Impact Breakdown:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {riskResult.feature_contributions.map((fc, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', fontSize: '0.82rem' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{fc.feature}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({fc.value})</span>
                        </div>
                        <span className={`badge ${fc.impact.includes('High') ? 'badge-high' : (fc.impact.includes('Moderate') ? 'badge-moderate' : 'badge-low')}`} style={{ fontSize: '0.7rem' }}>
                          {fc.impact}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div style={{ padding: '14px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '10px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: '#60a5fa', textTransform: 'uppercase', marginBottom: '6px' }}>
                    Targeted Clinical Interventions:
                  </h4>
                  <ul style={{ paddingLeft: '18px', fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {riskResult.clinical_recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Activity size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <p>Adjust physiological variables on the left and click "Calculate" to generate the SHAP feature breakdown.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. NEWS2 EARLY WARNING MODULE */}
      {activeModule === 'news2' && (
        <div className="grid-responsive-1-2">
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
              Physiological Vitals Entry
            </h3>
            <form onSubmit={handleCalculateNews2} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="grid-form-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Respiration Rate (bpm)</label>
                  <input type="number" className="input-field" value={rr} onChange={(e) => setRr(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Oxygen Saturation (%)</label>
                  <input type="number" className="input-field" value={spo2} onChange={(e) => setSpo2(e.target.value)} required />
                </div>
              </div>

              <div className="grid-form-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Supplemental O2 Therapy</label>
                  <select className="input-field" value={o2Therapy ? '1' : '0'} onChange={(e) => setO2Therapy(e.target.value === '1')}>
                    <option value="0">Room Air (0 pts)</option>
                    <option value="1">Supplemental O2 (+2 pts)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Systolic BP (mmHg)</label>
                  <input type="number" className="input-field" value={sbp} onChange={(e) => setSbp(e.target.value)} required />
                </div>
              </div>

              <div className="grid-form-2">
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Heart Rate (bpm)</label>
                  <input type="number" className="input-field" value={hr} onChange={(e) => setHr(e.target.value)} required />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Temperature (°C)</label>
                  <input type="number" step="0.1" className="input-field" value={temp} onChange={(e) => setTemp(e.target.value)} required />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Consciousness Level (ACVPU)</label>
                <select className="input-field" value={consciousness} onChange={(e) => setConsciousness(e.target.value)}>
                  <option value="Alert">Alert (0 pts)</option>
                  <option value="CVPU">Altered Mental Status / CVPU (+3 pts)</option>
                </select>
              </div>

              <button type="submit" className="btn-primary" disabled={newsLoading} style={{ marginTop: '8px' }}>
                {newsLoading ? 'Scoring...' : 'Compute NEWS2 Early Warning Score'}
              </button>
            </form>
          </div>

          {/* NEWS2 Result Display */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '16px', color: '#fff' }}>
              Standard Clinical Escalation Protocol
            </h3>

            {newsResult ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Aggregate NEWS2 Score</span>
                    <p style={{ fontSize: '2.4rem', fontWeight: '800', color: newsResult.clinical_risk_level === 'High' ? '#fb7185' : (newsResult.clinical_risk_level === 'Medium' ? '#fbbf24' : '#34d399'), fontFamily: 'var(--font-mono)' }}>
                      {newsResult.total_score}
                    </p>
                  </div>
                  <span className={`badge badge-${newsResult.clinical_risk_level.toLowerCase()}`} style={{ fontSize: '0.9rem', padding: '6px 14px' }}>
                    {newsResult.clinical_risk_level} Clinical Risk
                  </span>
                </div>

                <div style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.2)', fontSize: '0.85rem' }}>
                  <p style={{ fontWeight: '700', color: '#fb7185', marginBottom: '2px' }}>Clinical Response Trigger:</p>
                  <p style={{ color: 'var(--text-primary)' }}>{newsResult.clinical_response}</p>
                </div>

                {/* Breakdown per Parameter */}
                <div>
                  <h4 style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                    Parameter Sub-Scores:
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {newsResult.parameter_breakdown.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', fontSize: '0.82rem' }}>
                        <div>
                          <strong style={{ color: '#fff' }}>{item.parameter}</strong>
                          <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>({item.value})</span>
                        </div>
                        <span className={`badge ${item.sub_score === 3 ? 'badge-high' : (item.sub_score >= 1 ? 'badge-moderate' : 'badge-low')}`}>
                          +{item.sub_score} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Flame size={32} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
                <p>Input patient vitals and click "Compute NEWS2" to evaluate physiological deterioration.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ClinicalAI
