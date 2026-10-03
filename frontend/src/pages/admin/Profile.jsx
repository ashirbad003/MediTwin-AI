import React, { useState } from 'react';
import { 
  Building2, Shield, Settings, Save, CheckCircle, 
  Cpu, Sliders, Lock, Bell, Activity, Sparkles
} from 'lucide-react';

export default function AdminProfile() {
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    hospital_name: 'MediTwin Apex Medical Center & Research Institute',
    facility_code: 'APEX-MED-9941',
    address: 'Medical Campus District, Tech Health City',
    contact_email: 'operations@meditwin-apex.org',
    emergency_hotline: '+91 800-MED-TWIN',
    rag_confidence_threshold: '0.65',
    news2_alert_level: '5',
    readmission_risk_threshold: '0.40',
    audit_retention_days: '365'
  });

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1100px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
            Hospital Facility & Governance Settings
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          Hospital Administration & System Parameters
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
          Configure institutional facility metadata, telemetry thresholds for AI early warning, and compliance settings.
        </p>
      </div>

      {saved && (
        <div style={{ 
          padding: '14px 18px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: '#ecfdf5',
          border: '1px solid #a7f3d0',
          color: '#065f46',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          <CheckCircle size={18} />
          <span>System configuration and facility parameters saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        {/* Facility Information */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={20} color="var(--primary)" /> Hospital Facility Details
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Healthcare Institution Name
              </label>
              <input
                type="text"
                value={formData.hospital_name}
                onChange={(e) => setFormData({ ...formData, hospital_name: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Facility Identification Code
              </label>
              <input
                type="text"
                value={formData.facility_code}
                onChange={(e) => setFormData({ ...formData, facility_code: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Campus Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Operations Email
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Emergency Clinical Hotline
              </label>
              <input
                type="text"
                value={formData.emergency_hotline}
                onChange={(e) => setFormData({ ...formData, emergency_hotline: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
            </div>
          </div>
        </div>

        {/* AI & Clinical Safety Thresholds */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 18px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={20} color="var(--primary)" /> AI Model & Clinical Early Warning Thresholds
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                RAG Citation Confidence Floor
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="1.0"
                value={formData.rag_confidence_threshold}
                onChange={(e) => setFormData({ ...formData, rag_confidence_threshold: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Minimum vector similarity score</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                NEWS2 Emergency Escalation Trigger
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.news2_alert_level}
                onChange={(e) => setFormData({ ...formData, news2_alert_level: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Royal College of Physicians score limit</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Readmission Risk Flag Threshold
              </label>
              <input
                type="number"
                step="0.05"
                min="0.1"
                max="0.9"
                value={formData.readmission_risk_threshold}
                onChange={(e) => setFormData({ ...formData, readmission_risk_threshold: e.target.value })}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Predicted 30-day readmission probability</span>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            style={{
              padding: '12px 28px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--primary)',
              color: '#fff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: 'var(--shadow-primary)'
            }}
          >
            <Save size={18} /> Save Hospital Settings
          </button>
        </div>
      </form>
    </div>
  );
}