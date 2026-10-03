import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Clock, User, CheckCircle2, XCircle, Activity, MessageSquare, ChevronRight } from 'lucide-react'
import api from '../../services/api'

function DoctorAppointments() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeModal, setActiveModal] = useState(null)
  const [notesInput, setNotesInput] = useState('')
  const [statusInput, setStatusInput] = useState('completed')

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      const res = await api.get('/doctor/appointments')
      setAppointments(res.data.appointments || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (appointmentId) => {
    try {
      await api.patch(`/doctor/appointments/${appointmentId}`, {
        status: statusInput,
        doctor_notes: notesInput
      })
      setActiveModal(null)
      setNotesInput('')
      fetchAppointments()
    } catch (err) {
      alert('Failed to update appointment.')
    }
  }

  return (
    <div className="animate-fade" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>Physician Schedule & Consultations</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage clinical appointments, review patient indications, and record post-consultation observations.
        </p>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
          <Activity className="pulse-indicator" size={32} color="#3b82f6" style={{ margin: '0 auto 12px auto' }} />
          <p>Loading appointments...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={40} style={{ margin: '0 auto 12px auto', opacity: 0.5 }} />
          <p>No appointments scheduled currently.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: '24px' }}>
          <table className="custom-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Date & Time</th>
                <th>Type</th>
                <th>Reason & Symptoms</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((apt) => (
                <tr key={apt.id}>
                  <td>
                    <div>
                      <strong style={{ color: '#fff' }}>{apt.patient_name}</strong>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Patient ID #{apt.patient_id}</p>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <Calendar size={14} color="#60a5fa" />
                      <span>{apt.appointment_date}</span>
                      <Clock size={14} color="#34d399" style={{ marginLeft: '6px' }} />
                      <span>{apt.appointment_time}</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>
                      {apt.appointment_type}
                    </span>
                  </td>
                  <td>
                    <p style={{ fontSize: '0.85rem', color: '#fff' }}>{apt.reason || 'Routine Consultation'}</p>
                    {apt.symptoms && (
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Symptoms: {apt.symptoms}</p>
                    )}
                    {apt.doctor_notes && (
                      <p style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '2px' }}>Doctor's Note: {apt.doctor_notes}</p>
                    )}
                  </td>
                  <td>
                    <span className={`badge badge-${apt.status === 'completed' ? 'active' : (apt.status === 'cancelled' ? 'high' : 'moderate')}`}>
                      {apt.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => {
                          setActiveModal(apt)
                          setStatusInput(apt.status)
                          setNotesInput(apt.doctor_notes || '')
                        }}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(59, 130, 246, 0.15)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          fontSize: '0.78rem',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        Update
                      </button>
                      <Link
                        to={`/doctor/patients/${apt.patient_id}`}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid var(--border-subtle)',
                          color: 'var(--text-secondary)',
                          fontSize: '0.78rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        Twin <ChevronRight size={13} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Update Appointment Modal */}
      {activeModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          padding: '20px'
        }}>
          <div className="glass-card animate-fade" style={{ width: '100%', maxWidth: '460px', padding: '28px', background: '#121826' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>
              Update Consultation #{activeModal.id}
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
              Patient: {activeModal.patient_name} • {activeModal.appointment_date} at {activeModal.appointment_time}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Status</label>
                <select className="input-field" value={statusInput} onChange={(e) => setStatusInput(e.target.value)}>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Consultation & Follow-up Notes</label>
                <textarea
                  className="input-field"
                  rows={4}
                  placeholder="Record clinical summary, treatment compliance, and instructions..."
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleUpdateStatus(activeModal.id)}
                  className="btn-primary"
                  style={{ flex: 1 }}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments
