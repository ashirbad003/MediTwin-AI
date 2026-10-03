import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Bed, Activity, CheckCircle, AlertTriangle, RefreshCw, 
  UserCheck, Plus, Filter, User, X
} from 'lucide-react';

export default function BedManagement() {
  const [beds, setBeds] = useState([]);
  const [icuUnits, setIcuUnits] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('BEDS'); // 'BEDS' or 'ICU'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedItem, setSelectedItem] = useState(null); // For edit modal
  const [message, setMessage] = useState(null);

  // Edit Modal State
  const [editStatus, setEditStatus] = useState('AVAILABLE');
  const [editPatientId, setEditPatientId] = useState('');
  const [editVentilator, setEditVentilator] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bedsRes, icuRes, ptsRes] = await Promise.all([
        api.get('/admin/beds'),
        api.get('/admin/icu'),
        api.get('/doctor/patients') // reuse patient list
      ]);
      setBeds(bedsRes.data?.beds || (Array.isArray(bedsRes.data) ? bedsRes.data : []));
      setIcuUnits(icuRes.data?.icu_units || (Array.isArray(icuRes.data) ? icuRes.data : []));
      setPatients(ptsRes.data?.patients || (Array.isArray(ptsRes.data) ? ptsRes.data : []));
    } catch (err) {
      console.error('Failed to load bed/icu inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (item, type) => {
    setSelectedItem({ ...item, type });
    setEditStatus(item.status || 'AVAILABLE');
    setEditPatientId(item.patient_id || '');
    setEditVentilator(item.ventilator_assigned || false);
  };

  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    setMessage(null);

    try {
      if (selectedItem.type === 'BED') {
        await api.put(`/admin/beds/${selectedItem.id}`, {
          status: editStatus,
          patient_id: editStatus === 'OCCUPIED' && editPatientId ? parseInt(editPatientId) : null
        });
      } else {
        await api.put(`/admin/icu/${selectedItem.id}`, {
          status: editStatus,
          patient_id: editStatus === 'OCCUPIED' && editPatientId ? parseInt(editPatientId) : null,
          ventilator_assigned: editVentilator
        });
      }

      setMessage({ type: 'success', text: `${selectedItem.type === 'BED' ? 'Bed' : 'ICU Unit'} status updated.` });
      setSelectedItem(null);
      fetchData();
    } catch (err) {
      console.error('Update failed', err);
      setMessage({ type: 'error', text: 'Failed to update bed status.' });
    } finally {
      setSaving(false);
    }
  };

  const currentList = activeTab === 'BEDS' ? beds : icuUnits;
  const filteredList = currentList.filter(item => {
    if (statusFilter === 'ALL') return true;
    return item.status?.toUpperCase() === statusFilter;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Capacity & Ward Logistics
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Bed & Critical Care Allocation
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Monitor and manage inpatient beds, ward assignments, and ICU ventilators in real-time.
          </p>
        </div>

        <button 
          onClick={fetchData}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && (
        <div style={{ 
          padding: '14px 18px', 
          borderRadius: 'var(--radius-md)', 
          marginBottom: '24px', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          background: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
          border: `1px solid ${message.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          color: message.type === 'success' ? '#065f46' : '#991b1b',
          fontSize: '0.92rem',
          fontWeight: 600
        }}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tabs & Filter Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', background: 'var(--bg-subtle)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => { setActiveTab('BEDS'); setStatusFilter('ALL'); }}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'BEDS' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'BEDS' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Bed size={16} /> General & Specialty Beds ({beds.length})
          </button>
          <button
            onClick={() => { setActiveTab('ICU'); setStatusFilter('ALL'); }}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              background: activeTab === 'ICU' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'ICU' ? '#fff' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <Activity size={16} /> ICU Critical Units ({icuUnits.length})
          </button>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: statusFilter === st ? 'var(--text-main)' : 'var(--bg-card)',
                color: statusFilter === st ? 'var(--bg-main)' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                border: '1px solid var(--border)'
              }}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bed Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
          <p style={{ margin: 0, fontWeight: 600 }}>Loading unit status...</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {filteredList.map((item) => {
            const isAvail = item.status === 'AVAILABLE';
            const isOcc = item.status === 'OCCUPIED';
            const isMaint = item.status === 'MAINTENANCE';

            return (
              <div 
                key={item.id}
                style={{ 
                  background: 'var(--bg-card)', 
                  border: '1px solid var(--border)', 
                  borderRadius: 'var(--radius-lg)', 
                  padding: '20px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  borderTop: `4px solid ${isAvail ? '#10b981' : isOcc ? '#ef4444' : '#f59e0b'}`
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 2px 0', fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {activeTab === 'BEDS' ? `Bed ${item.bed_number}` : `ICU #${item.unit_number}`}
                      </h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {activeTab === 'BEDS' ? (item.ward || 'General Ward') : (item.room_number || 'Critical Care')}
                      </span>
                    </div>

                    <span style={{
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      background: isAvail ? '#ecfdf5' : isOcc ? '#fef2f2' : '#fef3c7',
                      color: isAvail ? '#059669' : isOcc ? '#dc2626' : '#d97706',
                      border: `1px solid ${isAvail ? '#a7f3d0' : isOcc ? '#fecaca' : '#fde68a'}`
                    }}>
                      {item.status}
                    </span>
                  </div>

                  {activeTab === 'ICU' && item.ventilator_assigned && (
                    <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 'var(--radius-sm)', padding: '6px 10px', fontSize: '0.78rem', color: '#1d4ed8', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Activity size={14} /> Mechanical Ventilator Attached
                    </div>
                  )}

                  <div style={{ background: 'var(--bg-subtle)', padding: '12px', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    {isOcc ? (
                      <div>
                        <strong>Assigned Patient:</strong>
                        <div style={{ color: 'var(--text-main)', fontWeight: 600, marginTop: '2px' }}>
                          {item.patient_name || `Patient ID: #${item.patient_id}`}
                        </div>
                      </div>
                    ) : isAvail ? (
                      <div style={{ color: '#059669', fontWeight: 600 }}>
                        Ready for patient admission
                      </div>
                    ) : (
                      <div style={{ color: '#d97706', fontWeight: 600 }}>
                        Sanitization & maintenance in progress
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenEdit(item, activeTab === 'BEDS' ? 'BED' : 'ICU')}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-main)',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Manage Status & Patient
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Bed Modal */}
      {selectedItem && (
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
            maxWidth: '480px',
            boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)' }}>
                Manage {selectedItem.type === 'BED' ? `Bed ${selectedItem.bed_number}` : `ICU #${selectedItem.unit_number}`}
              </h3>
              <button 
                onClick={() => setSelectedItem(null)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveStatus} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Unit Status *
                </label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                >
                  <option value="AVAILABLE">AVAILABLE (Vacant & Sanitized)</option>
                  <option value="OCCUPIED">OCCUPIED (Admit Patient)</option>
                  <option value="MAINTENANCE">MAINTENANCE (Sterilization / Repair)</option>
                </select>
              </div>

              {editStatus === 'OCCUPIED' && (
                <div style={{ marginBottom: '18px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Assign Patient *
                  </label>
                  <select
                    value={editPatientId}
                    onChange={(e) => setEditPatientId(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.92rem' }}
                  >
                    <option value="">Select Inpatient</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name} (ID: #{p.id}) • Age {p.age || 'N/A'}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {selectedItem.type === 'ICU' && (
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="checkbox"
                    id="ventilator-checkbox"
                    checked={editVentilator}
                    onChange={(e) => setEditVentilator(e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                  />
                  <label htmlFor="ventilator-checkbox" style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer' }}>
                    Assign Mechanical Ventilator
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer' }}
                >
                  {saving ? 'Updating...' : 'Save Allocation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
