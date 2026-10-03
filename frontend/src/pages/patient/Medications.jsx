import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Pill, AlertCircle, CheckCircle, Clock, Calendar, Stethoscope, 
  RefreshCw, ShieldAlert, Sparkles, ChevronDown, ChevronUp, FileText
} from 'lucide-react';

export default function PatientMedications() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patient/prescriptions');
      const list = res.data?.prescriptions || (Array.isArray(res.data) ? res.data : []);
      setPrescriptions(list);
      if (list.length > 0) {
        setExpandedId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load patient prescriptions', err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten active medications
  const allMedications = prescriptions.flatMap(p => 
    (p.items || []).map(item => ({
      ...item,
      doctorName: p.doctor_name,
      prescribedDate: p.created_at,
      diagnosis: p.diagnosis,
      prescriptionId: p.id
    }))
  );

  return (
    <div style={{ padding: '28px', maxWidth: '1300px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Pharmacotherapy & Regimen
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Active Prescriptions & Medications
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Track daily dosages, prescribed schedules, and clinical safety instructions from your doctors.
          </p>
        </div>

        <button 
          onClick={fetchPrescriptions}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {/* Safety Notice */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Sparkles size={22} color="#2563eb" style={{ flexShrink: 0 }} />
        <div style={{ fontSize: '0.9rem', color: '#1e40af' }}>
          <strong>Automated Safety Verification:</strong> All prescribed regimens are validated through MediTwin-AI's pairwise drug-drug interaction matrix and cross-checked against your recorded allergy profile.
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading prescription records...</p>
        </div>
      ) : prescriptions.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-lg)', padding: '60px 20px', textAlign: 'center' }}>
          <Pill size={48} color="var(--text-muted)" style={{ margin: '0 auto 16px', opacity: 0.5 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
            No Prescriptions on File
          </h3>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
            Your doctor will generate digital prescriptions during your clinical consultations.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
          {/* Prescriptions Accordion List */}
          {prescriptions.map((p) => {
            const isExpanded = expandedId === p.id;
            return (
              <div 
                key={p.id}
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-lg)', 
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                {/* Accordion Header */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                  style={{ 
                    padding: '18px 24px', 
                    background: isExpanded ? 'var(--bg-subtle)' : 'var(--bg-card)', 
                    cursor: 'pointer',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: isExpanded ? '1px solid var(--border)' : 'none'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: 'var(--radius-md)', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Pill size={22} />
                    </div>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        Rx: {p.diagnosis || 'Clinical Prescription'}
                      </h3>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>Prescribed by: <strong>{p.doctor_name || `Dr. (#${p.doctor_id})`}</strong></span>
                        <span>•</span>
                        <span>{new Date(p.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, padding: '3px 10px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                      {(p.items || []).length} Medicines
                    </span>
                    {isExpanded ? <ChevronUp size={20} color="var(--text-muted)" /> : <ChevronDown size={20} color="var(--text-muted)" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div style={{ padding: '24px' }}>
                    {p.notes && (
                      <div style={{ background: 'var(--bg-subtle)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                        <strong>Doctor's Clinical Notes:</strong> {p.notes}
                      </div>
                    )}

                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Prescribed Drug Items
                    </h4>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {(p.items || []).map((item, idx) => (
                        <div 
                          key={idx}
                          style={{ 
                            background: 'var(--bg-subtle)', 
                            border: '1px solid var(--border)', 
                            borderRadius: 'var(--radius-md)', 
                            padding: '16px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h5 style={{ margin: 0, fontSize: '1.02rem', fontWeight: 800, color: 'var(--primary)' }}>
                              {item.medicine_name}
                            </h5>
                            <span style={{ fontSize: '0.78rem', fontWeight: 700, background: 'var(--bg-card)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                              {item.dosage}
                            </span>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                            <div>
                              <strong>Frequency:</strong> {item.frequency || 'As advised'}
                            </div>
                            <div>
                              <strong>Duration:</strong> {item.duration || 'Full course'}
                            </div>
                          </div>

                          {item.instructions && (
                            <div style={{ fontSize: '0.82rem', background: 'var(--bg-card)', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--text-main)' }}>
                              <strong>Usage:</strong> {item.instructions}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
