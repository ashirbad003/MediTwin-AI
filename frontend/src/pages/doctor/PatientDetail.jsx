import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  HeartPulse,
  Activity,
  FileText,
  Pill,
  BrainCircuit,
  StickyNote,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  User,
  Phone,
  MapPin,
  Clock,
  Plus,
  ArrowLeft,
  ChevronRight
} from 'lucide-react'
import api from '../../services/api'

function PatientDetail() {
  const { id } = useParams()
  const [twin, setTwin] = useState(null)
  const [activeTab, setActiveTab] = useState('vitals')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // New Note state
  const [noteTitle, setNoteTitle] = useState('')
  const [noteCategory, setNoteCategory] = useState('general')
  const [noteContent, setNoteContent] = useState('')
  const [savingNote, setSavingNote] = useState(false)
  const [noteSuccess, setNoteSuccess] = useState('')

  useEffect(() => {
    fetchPatientDigitalTwin()
  }, [id])

  const fetchPatientDigitalTwin = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/doctor/patients/${id}`)
      setTwin(res.data.digital_twin)
    } catch (err) {
      setError('Unable to load patient digital twin record.')
    } finally {
      setLoading(false)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!noteTitle.trim() || !noteContent.trim()) return

    try {
      setSavingNote(true)
      await api.post(`/doctor/patients/${id}/notes`, {
        patient_id: parseInt(id),
        title: noteTitle.trim(),
        category: noteCategory,
        note_content: noteContent.trim()
      })
      setNoteSuccess('Clinical note successfully added to digital twin.')
      setNoteTitle('')
      setNoteContent('')
      fetchPatientDigitalTwin()
    } catch (err) {
      alert('Failed to save note.')
    } finally {
      setSavingNote(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="pulse-indicator" size={32} color="#3b82f6" style={{ margin: '0 auto 12px auto' }} />
        <p>Retrieving Patient 360° Digital Twin...</p>
      </div>
    )
  }

  if (error || !twin) {
    return (
      <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
        <p style={{ color: '#fb7185', marginBottom: '16px' }}>{error || 'Patient not found'}</p>
        <Link to="/doctor/patients" className="btn-secondary">
          <ArrowLeft size={16} /> Back to Patients
        </Link>
      </div>
    )
  }

  const profile = twin.profile || {}
  const latestVitals = (twin.vitals_history && twin.vitals_history[0]) || {}

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Breadcrumb & Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Link to="/doctor/patients" style={{ color: '#60a5fa' }}>Patients</Link>
          <ChevronRight size={14} />
          <span style={{ color: '#fff', fontWeight: '600' }}>{twin.full_name}</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={`/doctor/clinical-ai?patient_id=${twin.patient_id}`} className="btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
            <BrainCircuit size={15} /> Run AI Risk Model
          </Link>
          <Link to={`/doctor/prescriptions?patient_id=${twin.patient_id}`} className="btn-secondary" style={{ fontSize: '0.82rem', padding: '8px 14px' }}>
            <Pill size={15} /> Prescribe
          </Link>
        </div>
      </div>

      {/* Patient Header Digital Twin Card */}
      <div className="glass-card" style={{ padding: '24px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #2563eb, #10b981)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: '800',
              color: '#fff',
              boxShadow: '0 0 20px rgba(37, 99, 235, 0.4)'
            }}>
              {twin.full_name ? twin.full_name[0] : 'P'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fff' }}>{twin.full_name}</h2>
                <span className="badge badge-cyan">Patient ID #{twin.patient_id}</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '4px' }}>
                {profile.gender || 'Unknown'} • DOB: {profile.date_of_birth || 'N/A'} • Blood Group: <strong style={{ color: '#fff' }}>{profile.blood_group || 'N/A'}</strong>
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px' }}>
                Emergency Contact: {profile.emergency_contact || 'None registered'} • Phone: {profile.phone || 'N/A'}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Blood Pressure</span>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                {latestVitals.systolic_bp ? `${latestVitals.systolic_bp}/${latestVitals.diastolic_bp}` : '120/80'}
              </p>
            </div>
            <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Heart Rate</span>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                {latestVitals.heart_rate || 72} bpm
              </p>
            </div>
            <div style={{ padding: '10px 16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', border: '1px solid var(--border-subtle)', textAlign: 'center' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>SpO2 Level</span>
              <p style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34d399', fontFamily: 'var(--font-mono)' }}>
                {latestVitals.oxygen_saturation || 98}%
              </p>
            </div>
          </div>
        </div>

        {/* Chronic Conditions & Allergies Bar */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Diagnoses:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {twin.conditions.map((c) => (
                <span key={c.id} className="badge badge-cyan">{c.condition_name} ({c.status})</span>
              ))}
              {twin.conditions.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>None</span>}
            </div>
          </div>

          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fb7185', textTransform: 'uppercase' }}>Documented Allergies:</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '4px' }}>
              {twin.allergies.map((a) => (
                <span key={a.id} className="badge badge-high">⚠️ {a.allergen} ({a.severity})</span>
              ))}
              {twin.allergies.length === 0 && <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No known allergies</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '10px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
        {[
          { key: 'vitals', label: 'Vitals Timeline', icon: <HeartPulse size={16} /> },
          { key: 'reports', label: `Lab Reports (${twin.reports.length})`, icon: <FileText size={16} /> },
          { key: 'prescriptions', label: `Prescriptions (${twin.prescriptions.length})`, icon: <Pill size={16} /> },
          { key: 'ai_risk', label: 'AI Risk Predictions', icon: <BrainCircuit size={16} /> },
          { key: 'notes', label: `Clinical Notes (${twin.clinical_notes.length})`, icon: <StickyNote size={16} /> }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: activeTab === tab.key ? '1px solid rgba(59, 130, 246, 0.4)' : 'none',
              background: activeTab === tab.key ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: activeTab === tab.key ? '#60a5fa' : 'var(--text-secondary)',
              fontWeight: activeTab === tab.key ? '600' : '500',
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Vitals Timeline */}
      {activeTab === 'vitals' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: '700', marginBottom: '16px' }}>Longitudinal Vitals Timeline</h3>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Blood Pressure (mmHg)</th>
                <th>Heart Rate (bpm)</th>
                <th>SpO2 (%)</th>
                <th>Blood Glucose (mg/dL)</th>
                <th>BMI</th>
                <th>Clinical Notes</th>
              </tr>
            </thead>
            <tbody>
              {twin.vitals_history.map((v) => (
                <tr key={v.id}>
                  <td style={{ color: '#fff', fontWeight: '500' }}>{v.recorded_at || 'Recent'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.systolic_bp}/{v.diastolic_bp}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.heart_rate}</td>
                  <td style={{ fontFamily: 'var(--font-mono)', color: '#34d399' }}>{v.oxygen_saturation}%</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.blood_glucose || 'N/A'}</td>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{v.bmi || 'N/A'}</td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>{v.notes || 'Routine check'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: Reports */}
      {activeTab === 'reports' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {twin.reports.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No medical reports uploaded yet.
            </div>
          ) : (
            twin.reports.map((rep) => (
              <div key={rep.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>{rep.title}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Type: {rep.report_type} • Uploaded: {rep.created_at}</p>
                  </div>
                  <span className={`badge ${rep.risk_level?.toLowerCase().includes('critical') ? 'badge-high' : (rep.risk_level?.toLowerCase().includes('attention') ? 'badge-moderate' : 'badge-low')}`}>
                    {rep.risk_level}
                  </span>
                </div>

                {/* Summaries */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                  <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)', fontSize: '0.82rem' }}>
                    <p style={{ fontWeight: '700', color: '#60a5fa', marginBottom: '4px' }}>Doctor Technical Interpretation:</p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rep.summary_doctor}</p>
                  </div>
                  <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '0.82rem' }}>
                    <p style={{ fontWeight: '700', color: '#34d399', marginBottom: '4px' }}>Patient-Friendly Summary:</p>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>{rep.summary_patient}</p>
                  </div>
                </div>

                {/* Lab Extracted Biomarkers */}
                {rep.extracted_data && (
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Extracted Laboratory Biomarkers:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                      {Object.entries(rep.extracted_data).map(([key, val]) => (
                        <div key={key} style={{ padding: '8px 10px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontSize: '0.78rem' }}>
                          <span style={{ color: 'var(--text-muted)' }}>{key}:</span>
                          <p style={{ fontWeight: '700', color: '#fff', fontFamily: 'var(--font-mono)' }}>
                            {val.value} {val.unit}{' '}
                            <span style={{ color: val.status === 'Normal' ? '#34d399' : '#fb7185' }}>({val.status})</span>
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: Prescriptions */}
      {activeTab === 'prescriptions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {twin.prescriptions.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No active prescriptions on record.
            </div>
          ) : (
            twin.prescriptions.map((pr) => (
              <div key={pr.id} className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>Diagnosis: {pr.diagnosis || 'Clinical Prescription'}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Prescribed on: {pr.created_at}</p>
                  </div>
                  <span className="badge badge-active">{pr.status}</span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                  Doctor's Instructions: {pr.notes || 'Take medications as directed.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '10px' }}>
                  {pr.items.map((it) => (
                    <div key={it.id} style={{ padding: '12px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <strong style={{ color: '#fff' }}>{it.medicine_name}</strong>
                        <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{it.dosage}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Schedule: {it.frequency} • {it.duration}</p>
                      <p style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '2px' }}>Timing: {it.timing}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: AI Predictions */}
      {activeTab === 'ai_risk' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {twin.ai_predictions.length === 0 ? (
            <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '12px' }}>No previous AI risk evaluations recorded for this patient.</p>
              <Link to={`/doctor/clinical-ai?patient_id=${twin.patient_id}`} className="btn-primary">
                <BrainCircuit size={16} /> Run Clinical Decision Support Model
              </Link>
            </div>
          ) : (
            twin.ai_predictions.map((pred) => (
              <div key={pred.id} className="glass-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fff' }}>{pred.prediction_type}</h4>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Model: {pred.model_name} • Evaluated: {pred.created_at}</p>
                  </div>
                  <span className={`badge badge-${pred.risk_category.toLowerCase()}`} style={{ fontSize: '0.85rem' }}>
                    Risk Score: {pred.risk_score}% ({pred.risk_category})
                  </span>
                </div>

                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                  {pred.explanation_summary}
                </p>

                {pred.feature_contributions && (
                  <div>
                    <p style={{ fontSize: '0.78rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
                      Explainable AI (XAI) Contributing Drivers:
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      {pred.feature_contributions.map((fc, idx) => (
                        <div key={idx} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '8px 12px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          fontSize: '0.82rem'
                        }}>
                          <div>
                            <strong style={{ color: '#fff' }}>{fc.feature}</strong>
                            <span style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>({fc.value})</span>
                          </div>
                          <span className={`badge ${fc.impact.includes('High') ? 'badge-high' : (fc.impact.includes('Moderate') ? 'badge-moderate' : 'badge-low')}`} style={{ fontSize: '0.7rem' }}>
                            {fc.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 5: Clinical Notes */}
      {activeTab === 'notes' && (
        <div className="grid-responsive-2-1" style={{ gap: '20px' }}>
          {/* Notes list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Physician Consultation Notes</h3>
            {twin.clinical_notes.map((n) => (
              <div key={n.id} className="glass-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{n.title}</h4>
                  <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>{n.category}</span>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Logged on {n.created_at}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{n.content}</p>
              </div>
            ))}
            {twin.clinical_notes.length === 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No clinical notes added yet.</p>
            )}
          </div>

          {/* Add Note Form */}
          <div className="glass-card" style={{ padding: '20px', height: 'fit-content' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: '700', marginBottom: '14px', color: '#fff' }}>Add New Clinical Note</h4>

            {noteSuccess && (
              <div style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '6px', color: '#34d399', fontSize: '0.8rem', marginBottom: '12px' }}>
                {noteSuccess}
              </div>
            )}

            <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Note Title</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="e.g. Follow-up consultation"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Category</label>
                <select
                  className="input-field"
                  value={noteCategory}
                  onChange={(e) => setNoteCategory(e.target.value)}
                >
                  <option value="general">General Consultation</option>
                  <option value="progress">Progress Review</option>
                  <option value="discharge">Discharge Planning</option>
                  <option value="surgical">Pre/Post Procedure</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Clinical Observations</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Enter detailed physician findings, plan, and medication advice..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" disabled={savingNote} style={{ width: '100%' }}>
                {savingNote ? 'Saving Note...' : 'Save Clinical Note'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientDetail
