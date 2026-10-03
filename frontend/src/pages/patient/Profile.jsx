import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  User, Shield, Heart, Activity, AlertTriangle, Plus, 
  Trash2, Save, CheckCircle, RefreshCw, Phone, MapPin, Sparkles
} from 'lucide-react';

export default function PatientProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    date_of_birth: '',
    gender: 'OTHER',
    blood_group: '',
    address: '',
    emergency_contact: '',
    emergency_phone: '',
    height_cm: '',
    weight_kg: '',
    smoking_status: 'NEVER',
    alcohol_consumption: 'NONE',
    physical_activity_level: 'MODERATE'
  });

  // Allergy / Condition Modal State
  const [allergen, setAllergen] = useState('');
  const [allergySeverity, setAllergySeverity] = useState('MODERATE');
  const [conditionName, setConditionName] = useState('');
  const [conditionNotes, setConditionNotes] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/patient/profile');
      const p = res.data?.patient || res.data || {};
      setProfile(p);
      const rawGender = String(p.gender || '').toUpperCase();
      const normGender = rawGender === 'M' || rawGender === 'MALE' ? 'MALE' : (rawGender === 'F' || rawGender === 'FEMALE' ? 'FEMALE' : 'OTHER');

      setFormData({
        full_name: p.full_name || '',
        phone: p.phone || '',
        date_of_birth: p.date_of_birth ? String(p.date_of_birth).split('T')[0] : '',
        gender: normGender,
        blood_group: p.blood_group || '',
        address: p.address || '',
        emergency_contact: p.emergency_contact || '',
        emergency_phone: p.emergency_phone || '',
        height_cm: p.height_cm ?? p.height ?? '',
        weight_kg: p.weight_kg ?? p.weight ?? '',
        smoking_status: String(p.smoking_status || 'NEVER').toUpperCase(),
        alcohol_consumption: String(p.alcohol_consumption || p.alcohol_intake || 'NONE').toUpperCase(),
        physical_activity_level: String(p.physical_activity_level || p.physical_activity || 'MODERATE').toUpperCase()
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const hVal = formData.height_cm ? parseFloat(formData.height_cm) : null;
      const wVal = formData.weight_kg ? parseFloat(formData.weight_kg) : null;
      const payload = {
        ...formData,
        height: hVal,
        height_cm: hVal,
        weight: wVal,
        weight_kg: wVal,
        smoking_status: formData.smoking_status.toLowerCase(),
        alcohol_intake: formData.alcohol_consumption.toLowerCase(),
        alcohol_consumption: formData.alcohol_consumption.toLowerCase(),
        physical_activity: formData.physical_activity_level.toLowerCase(),
        physical_activity_level: formData.physical_activity_level.toLowerCase()
      };

      const res = await api.put('/patient/profile', payload);
      const updated = res.data?.patient || res.data || {};
      setProfile(updated);
      setMessage({ type: 'success', text: 'Health profile updated successfully!' });
    } catch (err) {
      console.error('Update failed', err);
      setMessage({ type: 'error', text: 'Failed to update profile.' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddAllergy = async (e) => {
    e.preventDefault();
    if (!allergen.trim()) return;
    try {
      await api.post('/patient/allergies', {
        allergen: allergen.trim(),
        severity: allergySeverity,
        reaction: 'Adverse clinical reaction'
      });
      setAllergen('');
      fetchProfile();
      setMessage({ type: 'success', text: 'Allergy added to medical record.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add allergy.' });
    }
  };

  const handleDeleteAllergy = async (id) => {
    try {
      await api.delete(`/patient/allergies/${id}`);
      fetchProfile();
    } catch (err) {
      console.error('Failed to delete allergy', err);
    }
  };

  const handleAddCondition = async (e) => {
    e.preventDefault();
    if (!conditionName.trim()) return;
    try {
      await api.post('/patient/conditions', {
        condition_name: conditionName.trim(),
        status: 'ACTIVE',
        notes: conditionNotes
      });
      setConditionName('');
      setConditionNotes('');
      fetchProfile();
      setMessage({ type: 'success', text: 'Chronic condition added.' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to add condition.' });
    }
  };

  const handleDeleteCondition = async (id) => {
    try {
      await api.delete(`/patient/conditions/${id}`);
      fetchProfile();
    } catch (err) {
      console.error('Failed to delete condition', err);
    }
  };

  const bmi = formData.height_cm && formData.weight_kg 
    ? (formData.weight_kg / Math.pow(formData.height_cm / 100, 2)).toFixed(1)
    : null;

  return (
    <div style={{ padding: '28px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
            Patient Demographics & Medical Profile
          </span>
        </div>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
          My Health Twin Profile
        </h1>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
          Maintain accurate baseline parameters, clinical allergies, and lifestyle factors to optimize AI early-warning models.
        </p>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} animate-fade`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading profile details...</p>
        </div>
      ) : (
        <div className="grid-responsive-2-1">
          {/* Main Edit Form */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={20} color="var(--primary)" /> Personal & Baseline Data
            </h3>

            <form onSubmit={handleProfileUpdate}>
              <div className="grid-form-2" style={{ marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Full Legal Name *
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    className="input-field"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid-form-3" style={{ marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    className="input-field"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Gender
                  </label>
                  <select
                    className="input-field"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Blood Group
                  </label>
                  <select
                    className="input-field"
                    value={formData.blood_group}
                    onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    placeholder="e.g. 175"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    placeholder="e.g. 72"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Emergency Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.emergency_phone}
                    onChange={(e) => setFormData({ ...formData, emergency_phone: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Smoking
                  </label>
                  <select
                    value={formData.smoking_status}
                    onChange={(e) => setFormData({ ...formData, smoking_status: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="NEVER">Never</option>
                    <option value="FORMER">Former</option>
                    <option value="OCCASIONAL">Occasional</option>
                    <option value="REGULAR">Regular</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Alcohol
                  </label>
                  <select
                    value={formData.alcohol_consumption}
                    onChange={(e) => setFormData({ ...formData, alcohol_consumption: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="NONE">None</option>
                    <option value="OCCASIONAL">Occasional</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="HEAVY">Heavy</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Exercise
                  </label>
                  <select
                    value={formData.physical_activity_level}
                    onChange={(e) => setFormData({ ...formData, physical_activity_level: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="SEDENTARY">Sedentary</option>
                    <option value="LIGHT">Light</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: '12px 24px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--primary)',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: 'var(--shadow-primary)'
                }}
              >
                {saving ? <RefreshCw size={18} className="spin-animation" /> : <Save size={18} />}
                Save Changes
              </button>
            </form>
          </div>

          {/* Side Panels: Digital Twin Vitals, Allergies & Conditions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Quick Vitals Summary Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h4 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--primary)" /> Biometric Indices
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>BMI Index</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{bmi || '--'}</strong>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'block' }}>
                    {bmi ? (bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese') : ''}
                  </span>
                </div>
                <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block' }}>Blood Type</span>
                  <strong style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>{formData.blood_group}</strong>
                </div>
              </div>
            </div>

            {/* Allergies Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={18} /> Drug & Food Allergies
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {(profile?.allergies || []).length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No allergies recorded (NKDA)</span>
                ) : (
                  profile.allergies.map(a => (
                    <span 
                      key={a.id}
                      style={{ 
                        background: '#fef2f2', 
                        border: '1px solid #fecaca', 
                        color: '#b91c1c', 
                        padding: '4px 10px', 
                        borderRadius: '16px', 
                        fontSize: '0.8rem', 
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {a.allergen} ({a.severity})
                      <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => handleDeleteAllergy(a.id)} />
                    </span>
                  ))
                )}
              </div>

              <form onSubmit={handleAddAllergy} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add allergy (e.g. Penicillin)"
                  value={allergen}
                  onChange={(e) => setAllergen(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: '#dc2626', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={16} />
                </button>
              </form>
            </div>

            {/* Chronic Conditions Card */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Heart size={18} color="var(--primary)" /> Medical Conditions
              </h4>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
                {(profile?.conditions || []).length === 0 ? (
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No chronic conditions recorded</span>
                ) : (
                  profile.conditions.map(c => (
                    <span 
                      key={c.id}
                      style={{ 
                        background: 'var(--primary-subtle)', 
                        border: '1px solid var(--primary-border)', 
                        color: 'var(--primary)', 
                        padding: '4px 10px', 
                        borderRadius: '16px', 
                        fontSize: '0.8rem', 
                        fontWeight: 700,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      {c.condition_name}
                      <Trash2 size={12} style={{ cursor: 'pointer' }} onClick={() => handleDeleteCondition(c.id)} />
                    </span>
                  ))
                )}
              </div>

              <form onSubmit={handleAddCondition} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Add condition (e.g. Hypertension)"
                  value={conditionName}
                  onChange={(e) => setConditionName(e.target.value)}
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.85rem' }}
                />
                <button
                  type="submit"
                  style={{ padding: '8px 12px', borderRadius: 'var(--radius-md)', background: 'var(--primary)', color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer' }}
                >
                  <Plus size={16} />
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}