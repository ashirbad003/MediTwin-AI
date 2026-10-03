import React, { useState, useEffect } from 'react'
import { Stethoscope, User, Award, Shield, DollarSign, Clock, CheckCircle2, Save, Activity } from 'lucide-react'
import api from '../../services/api'
import { getUser } from '../../utils/auth'

function DoctorProfile() {
  const user = getUser()
  const [profile, setProfile] = useState({
    specialization: '',
    qualification: '',
    license_number: '',
    experience_years: 5,
    department: '',
    bio: '',
    consultation_fee: 500,
    availability: 'Mon-Fri, 9:00 AM - 5:00 PM'
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await api.get('/doctor/profile')
      if (res.data) {
        setProfile({
          specialization: res.data.specialization || '',
          qualification: res.data.qualification || '',
          license_number: res.data.license_number || '',
          experience_years: res.data.experience_years || 5,
          department: res.data.department || '',
          bio: res.data.bio || '',
          consultation_fee: res.data.consultation_fee || 500,
          availability: res.data.availability || 'Mon-Fri, 9:00 AM - 5:00 PM'
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setSuccess('')
      await api.patch('/doctor/profile', profile)
      setSuccess('Physician credentials and profile updated successfully.')
    } catch (err) {
      alert('Failed to update doctor profile.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <Activity className="pulse-indicator" size={32} color="#3b82f6" style={{ margin: '0 auto 12px auto' }} />
        <p>Loading credentials...</p>
      </div>
    )
  }

  return (
    <div className="animate-fade" style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#fff' }}>Physician Profile & Credentials</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your clinical specialization, medical license credentials, department, and consultation schedule.
        </p>
      </div>

      {success && (
        <div style={{ padding: '14px 18px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div className="glass-card" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <Stethoscope size={28} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#fff' }}>{user?.full_name}</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email} • Verified Medical Practitioner</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Primary Specialization
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Interventional Cardiology"
                value={profile.specialization}
                onChange={(e) => setProfile({ ...profile, specialization: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Assigned Department
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Cardiology & Vascular Medicine"
                value={profile.department}
                onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Medical License Number
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. MED-CARD-9921"
                value={profile.license_number}
                onChange={(e) => setProfile({ ...profile, license_number: e.target.value })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Years of Clinical Experience
              </label>
              <input
                type="number"
                className="input-field"
                value={profile.experience_years}
                onChange={(e) => setProfile({ ...profile, experience_years: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Academic Qualifications & Fellowship
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="e.g. MBBS, MD (Internal Medicine), DM (Cardiology)"
              value={profile.qualification}
              onChange={(e) => setProfile({ ...profile, qualification: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Consultation Fee ($/₹)
              </label>
              <input
                type="number"
                className="input-field"
                value={profile.consultation_fee}
                onChange={(e) => setProfile({ ...profile, consultation_fee: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
                Weekly Availability Schedule
              </label>
              <input
                type="text"
                className="input-field"
                placeholder="e.g. Mon-Fri, 9:00 AM - 5:00 PM"
                value={profile.availability}
                onChange={(e) => setProfile({ ...profile, availability: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.82rem', fontWeight: '600', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Professional Biography
            </label>
            <textarea
              className="input-field"
              rows={3}
              placeholder="Brief summary of clinical expertise, research interests, and bedside focus..."
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ padding: '12px', marginTop: '8px' }}
          >
            {saving ? 'Updating Credentials...' : 'Save Profile Changes'} <Save size={16} />
          </button>
        </form>
      </div>
    </div>
  )
}

export default DoctorProfile