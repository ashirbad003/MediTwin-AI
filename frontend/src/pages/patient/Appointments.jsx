import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Calendar, Clock, User, PlusCircle, CheckCircle, AlertTriangle, 
  XCircle, Stethoscope, MapPin, RefreshCw, ChevronRight
} from 'lucide-react';

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [message, setMessage] = useState(null);

  // Booking Form State
  const [formData, setFormData] = useState({
    doctor_id: '',
    appointment_date: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, docRes] = await Promise.all([
        api.get('/patient/appointments'),
        api.get('/patient/doctors')
      ]);
      const appList = appRes.data?.appointments || (Array.isArray(appRes.data) ? appRes.data : []);
      const docList = docRes.data?.doctors || (Array.isArray(docRes.data) ? docRes.data : []);
      setAppointments(appList);
      setDoctors(docList);
      if (docList.length > 0 && !formData.doctor_id) {
        setFormData(prev => ({ ...prev, doctor_id: docList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load appointments data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!formData.doctor_id || !formData.appointment_date || !formData.reason) {
      setMessage({ type: 'error', text: 'Please fill in all booking fields.' });
      return;
    }

    setBooking(true);
    setMessage(null);

    try {
      await api.post('/patient/appointments', {
        doctor_id: parseInt(formData.doctor_id),
        appointment_date: new Date(formData.appointment_date).toISOString(),
        reason: formData.reason
      });
      setMessage({ type: 'success', text: 'Appointment booked successfully!' });
      setShowBookModal(false);
      setFormData({
        doctor_id: doctors[0]?.id || '',
        appointment_date: '',
        reason: ''
      });
      fetchData();
    } catch (err) {
      console.error('Booking failed', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to schedule appointment.' 
      });
    } finally {
      setBooking(false);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.put(`/patient/appointments/${id}/cancel`);
      setMessage({ type: 'success', text: 'Appointment cancelled.' });
      fetchData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to cancel appointment.' });
    }
  };

  const filteredAppointments = appointments.filter(a => {
    if (filter === 'ALL') return true;
    return a.status?.toUpperCase() === filter;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Telehealth & Consultations
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Clinical Appointments
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Schedule and manage specialist consultations, follow-ups, and review past clinical visits.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={() => setShowBookModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}
          >
            <PlusCircle size={18} /> Book Appointment
          </button>
        </div>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} animate-fade`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              border: 'none',
              background: filter === tab ? 'var(--primary)' : 'var(--bg-subtle)',
              color: filter === tab ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointment Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading appointment records...</p>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '50px 20px', textAlign: 'center' }}>
          <Calendar size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            No {filter !== 'ALL' ? filter.toLowerCase() : ''} appointments found
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: '0 0 20px 0', fontSize: '0.9rem' }}>
            Schedule a consultation with an on-duty medical specialist or doctor.
          </p>
          <button 
            onClick={() => setShowBookModal(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
          >
            <PlusCircle size={18} /> Schedule Visit
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredAppointments.map((app) => {
            const isScheduled = app.status?.toUpperCase() === 'SCHEDULED';
            const isCompleted = app.status?.toUpperCase() === 'COMPLETED';
            const isCancelled = app.status?.toUpperCase() === 'CANCELLED';

            return (
              <div 
                key={app.id} 
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        <Stethoscope size={20} />
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 2px 0', fontSize: '1.02rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {app.doctor_name || `Dr. Specialist (#${app.doctor_id})`}
                        </h4>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {app.doctor_specialization || 'Clinical Physician'}
                        </span>
                      </div>
                    </div>
                    <span className={`badge ${isScheduled ? 'badge-info' : isCompleted ? 'badge-low' : 'badge-high'}`}>
                      {app.status || 'SCHEDULED'}
                    </span>
                  </div>

                  <div style={{ background: 'var(--bg-subtle)', padding: '12px 14px', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-main)', marginBottom: '6px' }}>
                      <Calendar size={15} color="var(--primary)" />
                      <strong>{new Date(app.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      <Clock size={15} color="var(--primary)" />
                      <span>{new Date(app.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <strong>Reason for visit:</strong>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-main)' }}>{app.reason}</p>
                  </div>
                </div>

                {isScheduled && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => handleCancelAppointment(app.id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', color: '#e11d48', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <XCircle size={14} /> Cancel Appointment
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '540px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Calendar size={20} color="var(--primary)" /> Book Doctor Consultation
              </h3>
              <button 
                onClick={() => setShowBookModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem', fontWeight: 700 }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookAppointment} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Select Doctor / Specialist *
                </label>
                <select
                  value={formData.doctor_id}
                  onChange={(e) => setFormData({ ...formData, doctor_id: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                  required
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>
                      Dr. {d.full_name || d.user_email} — {d.specialization} ({d.department || 'General'}) • ₹{d.consultation_fee || 500}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.appointment_date}
                  onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Reason for Visit / Chief Symptoms *
                </label>
                <textarea
                  rows="3"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="E.g., Routine cardiac follow-up, persistent cough for 4 days, medication review..."
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.92rem', resize: 'vertical' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={booking}
                  style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: booking ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  {booking ? <RefreshCw size={16} className="spin-animation" /> : <CheckCircle size={16} />}
                  Confirm Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
