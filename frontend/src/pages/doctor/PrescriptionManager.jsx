import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Pill,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  ShieldAlert,
  Send,
  Sparkles,
  Info,
  BookOpen
} from 'lucide-react'
import api from '../../services/api'

function PrescriptionManager() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const preselectedPatientId = searchParams.get('patient_id') || ''

  const [patients, setPatients] = useState([])
  const [selectedPatientId, setSelectedPatientId] = useState(preselectedPatientId)
  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')

  const [items, setItems] = useState([
    { medicine_name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily (1-0-0)', duration: '30 days', timing: 'After breakfast', instructions: 'Monitor BP weekly' },
    { medicine_name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily (0-0-1)', duration: '30 days', timing: 'At bedtime', instructions: 'Take regularly at night' }
  ])

  // Interaction check state
  const [interactionResult, setInteractionResult] = useState(null)
  const [checkingInteractions, setCheckingInteractions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    fetchPatients()
  }, [])

  useEffect(() => {
    // Auto-check interactions whenever items or selected patient changes
    if (items.some(it => it.medicine_name.trim())) {
      runInteractionCheck()
    }
  }, [items, selectedPatientId])

  const fetchPatients = async () => {
    try {
      const res = await api.get('/doctor/patients')
      setPatients(res.data.patients || [])
      if (!selectedPatientId && res.data.patients?.length > 0) {
        setSelectedPatientId(res.data.patients[0].patient_id.toString())
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      { medicine_name: '', dosage: '500mg', frequency: 'Twice daily (1-0-1)', duration: '7 days', timing: 'After meals', instructions: '' }
    ])
  }

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index, field, value) => {
    const updated = [...items]
    updated[index][field] = value
    setItems(updated)
  }

  const runInteractionCheck = async () => {
    const medNames = items.map(it => it.medicine_name.trim()).filter(Boolean)
    if (medNames.length === 0) return

    try {
      setCheckingInteractions(true)
      const res = await api.post('/prescriptions/check-interactions', {
        medications: medNames,
        patient_id: selectedPatientId ? parseInt(selectedPatientId) : null
      })
      setInteractionResult(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setCheckingInteractions(false)
    }
  }

  const handleSavePrescription = async (e) => {
    e.preventDefault()
    if (!selectedPatientId) {
      alert('Please select a patient.')
      return
    }

    const validItems = items.filter(it => it.medicine_name.trim())
    if (validItems.length === 0) {
      alert('Please specify at least one medication.')
      return
    }

    try {
      setSubmitting(true)
      const res = await api.post('/doctor/prescriptions', {
        patient_id: parseInt(selectedPatientId),
        diagnosis: diagnosis || 'Clinical Consultation',
        notes: notes,
        items: validItems
      })

      setSuccessMsg('Prescription successfully saved and sent to patient digital twin.')
      setTimeout(() => {
        navigate(`/doctor/patients/${selectedPatientId}`)
      }, 1500)
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to generate prescription.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>
          Smart Prescription Intelligence Manager
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Real-time pairwise drug interaction evaluation, cross-reactivity allergy checking, and structured regimen generation.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={20} />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid-responsive-2-1" style={{ gap: '24px' }}>
        {/* Prescription Form */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <form onSubmit={handleSavePrescription} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Patient Selector */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Select Patient Digital Twin
              </label>
              <select
                className="input-field"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                required
              >
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.full_name} (ID #{p.patient_id} • Blood {p.blood_group} • {p.risk_category} Risk)
                  </option>
                ))}
              </select>
            </div>

            {/* Diagnosis */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Clinical Diagnosis / Indication
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Stage 2 Essential Hypertension with Dyslipidemia"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
              />
            </div>

            {/* Medications List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
                  Prescribed Medications ({items.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '0.78rem' }}
                >
                  <Plus size={14} /> Add Medicine
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((it, idx) => (
                  <div key={idx} style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Medicine name (e.g. Lisinopril, Warfarin, Metformin)"
                        value={it.medicine_name}
                        onChange={(e) => handleItemChange(idx, 'medicine_name', e.target.value)}
                        required
                        style={{ flex: 2 }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Dosage (e.g. 10mg)"
                        value={it.dosage}
                        onChange={(e) => handleItemChange(idx, 'dosage', e.target.value)}
                        required
                        style={{ flex: 1 }}
                      />
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          style={{
                            background: 'rgba(244, 63, 94, 0.1)',
                            border: '1px solid rgba(244, 63, 94, 0.2)',
                            color: '#fb7185',
                            padding: '8px',
                            borderRadius: '8px',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Frequency (e.g. Once daily)"
                        value={it.frequency}
                        onChange={(e) => handleItemChange(idx, 'frequency', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Duration (e.g. 30 days)"
                        value={it.duration}
                        onChange={(e) => handleItemChange(idx, 'duration', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                      <input
                        type="text"
                        className="input-field"
                        placeholder="Timing (e.g. After meals)"
                        value={it.timing}
                        onChange={(e) => handleItemChange(idx, 'timing', e.target.value)}
                        style={{ fontSize: '0.8rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Doctor instructions */}
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Instructions / Lifestyle Advice
              </label>
              <textarea
                className="input-field"
                rows={3}
                placeholder="Dietary precautions, hydration advice, or warning symptoms..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={submitting} style={{ padding: '12px' }}>
              {submitting ? 'Generating Prescription...' : 'Authorize & Issue Prescription'} <Send size={16} />
            </button>
          </form>
        </div>

        {/* Real-time Interaction Matrix & Warnings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#fff' }}>
                Safety & Allergy Surveillance
              </h3>
              {checkingInteractions && <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>Evaluating...</span>}
            </div>

            {/* Allergy Warnings */}
            {interactionResult?.allergy_warnings?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                {interactionResult.allergy_warnings.map((warn, i) => (
                  <div key={i} style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.35)', borderRadius: '8px', color: '#fb7185', fontSize: '0.82rem' }}>
                    <strong>⚠️ {warn}</strong>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                <CheckCircle2 size={16} /> No patient allergy cross-reactivities detected.
              </div>
            )}

            {/* Drug Interactions */}
            {interactionResult?.interactions?.length > 0 ? (
              <div>
                <p style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fb7185', textTransform: 'uppercase', marginBottom: '8px' }}>
                  ⚠️ Drug-Drug Interaction Alerts ({interactionResult.interactions.length}):
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {interactionResult.interactions.map((it, idx) => (
                    <div key={idx} style={{ padding: '12px', background: 'rgba(244, 63, 94, 0.08)', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.82rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <strong style={{ color: '#fff' }}>{it.drug_a} + {it.drug_b}</strong>
                        <span className={`badge ${it.severity === 'Major' ? 'badge-high' : 'badge-moderate'}`} style={{ fontSize: '0.68rem' }}>
                          {it.severity} Severity
                        </span>
                      </div>
                      <p style={{ color: '#fca5a5', marginBottom: '4px' }}>{it.interaction_effect}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}><strong>Recommended Action:</strong> {it.action_required}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{ padding: '10px 12px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '8px', color: '#34d399', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} /> No major drug-drug interactions detected for this regimen.
              </div>
            )}
          </div>

          <div className="glass-card" style={{ padding: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa', fontWeight: '600', marginBottom: '4px' }}>
              <Info size={16} /> Clinical Pharmacology Notice
            </div>
            MediTwin-AI checks pairwise interaction monographs from British National Formulary and FDA safety advisories. Final prescriptive authority remains with the attending physician.
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionManager
