import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Package, AlertTriangle, CheckCircle, Plus, Search, 
  RefreshCw, Edit3, Trash2, Layers, DollarSign, Calendar
} from 'lucide-react';

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'LOW_STOCK', 'CRITICAL'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [message, setMessage] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    item_name: '',
    category: 'MEDICATION',
    quantity: '',
    unit: 'Tablets',
    reorder_threshold: '50',
    unit_price: '',
    batch_number: '',
    expiry_date: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/inventory');
      const rawList = res.data?.inventory || (Array.isArray(res.data) ? res.data : []);
      const normalized = rawList.map(item => ({
        ...item,
        quantity: item.quantity !== undefined ? item.quantity : (item.current_stock ?? 0),
        reorder_threshold: item.reorder_threshold !== undefined ? item.reorder_threshold : (item.minimum_threshold ?? 50),
        unit_price: item.unit_price !== undefined ? item.unit_price : (item.unit_cost ?? 0)
      }));
      setItems(normalized);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    setMessage(null);

    try {
      const payload = {
        item_name: formData.item_name,
        category: formData.category,
        quantity: parseInt(formData.quantity) || 0,
        unit: formData.unit,
        reorder_threshold: parseInt(formData.reorder_threshold) || 10,
        unit_price: parseFloat(formData.unit_price) || 0,
        batch_number: formData.batch_number || null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null
      };

      if (editItem) {
        await api.put(`/admin/inventory/${editItem.id}`, payload);
        setMessage({ type: 'success', text: 'Inventory item updated.' });
      } else {
        await api.post('/admin/inventory', payload);
        setMessage({ type: 'success', text: 'New item added to inventory.' });
      }

      setShowAddModal(false);
      setEditItem(null);
      setFormData({
        item_name: '',
        category: 'MEDICATION',
        quantity: '',
        unit: 'Tablets',
        reorder_threshold: '50',
        unit_price: '',
        batch_number: '',
        expiry_date: ''
      });
      fetchInventory();
    } catch (err) {
      console.error('Save failed', err);
      setMessage({ type: 'error', text: 'Failed to save inventory item.' });
    }
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      item_name: item.item_name,
      category: item.category || 'MEDICATION',
      quantity: item.quantity,
      unit: item.unit || 'Units',
      reorder_threshold: item.reorder_threshold || '50',
      unit_price: item.unit_price || '',
      batch_number: item.batch_number || '',
      expiry_date: item.expiry_date ? item.expiry_date.split('T')[0] : ''
    });
    setShowAddModal(true);
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(search.toLowerCase()) ||
                          (item.batch_number && item.batch_number.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;

    if (filter === 'LOW_STOCK') return item.quantity <= item.reorder_threshold;
    if (filter === 'CRITICAL') return item.quantity < item.reorder_threshold / 2;
    return true;
  });

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Supply Chain & Pharmacy Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Medicine & Hospital Consumables Inventory
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Track medication stock levels, reorder thresholds, batch expirations, and procurement forecasting.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchInventory}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button 
            onClick={() => { setEditItem(null); setShowAddModal(true); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 20px', background: 'var(--primary)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontWeight: 700, cursor: 'pointer', boxShadow: 'var(--shadow-primary)' }}
          >
            <Plus size={18} /> Add Stock Item
          </button>
        </div>
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

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '8px 14px', width: '320px' }}>
          <Search size={18} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search medicine or batch #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', outline: 'none', fontSize: '0.9rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'ALL', label: 'All Items' },
            { id: 'LOW_STOCK', label: 'Low Stock Alerts' },
            { id: 'CRITICAL', label: 'Critical Depletion' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: filter === f.id ? 'var(--primary)' : 'var(--bg-card)',
                color: filter === f.id ? '#fff' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                border: '1px solid var(--border)'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            <RefreshCw size={32} className="spin-animation" style={{ margin: '0 auto 12px' }} />
            <p style={{ margin: 0, fontWeight: 600 }}>Loading inventory ledger...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
            <h3 style={{ margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-main)' }}>No matching inventory items</h3>
            <p style={{ margin: 0, fontSize: '0.88rem' }}>Try adjusting your search criteria or add new supply items.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Item Name & Category</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Stock Level</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Reorder Threshold</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Unit Price</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Batch / Expiry</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700 }}>Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item, idx) => {
                  const isLow = item.quantity <= item.reorder_threshold;
                  const isCritical = item.quantity < item.reorder_threshold / 2;

                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.95rem' }}>
                          {item.item_name}
                        </div>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                          {item.category || 'Medication'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        <strong style={{ fontSize: '1.05rem', color: isCritical ? '#dc2626' : isLow ? '#d97706' : 'var(--text-main)' }}>
                          {item.quantity}
                        </strong>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                          {item.unit}
                        </span>
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-secondary)' }}>
                        {item.reorder_threshold} {item.unit}
                      </td>

                      <td style={{ padding: '14px 20px', color: 'var(--text-main)', fontWeight: 600 }}>
                        {item.unit_price ? `₹${item.unit_price}` : '—'}
                      </td>

                      <td style={{ padding: '14px 20px', fontSize: '0.85rem' }}>
                        <div><strong>Batch:</strong> {item.batch_number || 'N/A'}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                          Exp: {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>

                      <td style={{ padding: '14px 20px' }}>
                        {isCritical ? (
                          <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                            CRITICAL
                          </span>
                        ) : isLow ? (
                          <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a' }}>
                            REORDER
                          </span>
                        ) : (
                          <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 800, background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                            OPTIMAL
                          </span>
                        )}
                      </td>

                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          style={{ padding: '6px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Edit3 size={14} /> Update Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Stock Modal */}
      {showAddModal && (
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
                <Package size={20} color="var(--primary)" /> {editItem ? 'Update Stock Item' : 'New Inventory Item'}
              </h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveItem} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Item / Medicine Name *
                </label>
                <input
                  type="text"
                  value={formData.item_name}
                  onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                  placeholder="e.g. Atorvastatin 20mg"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  >
                    <option value="MEDICATION">Medication</option>
                    <option value="CONSUMABLE">Consumable / PPE</option>
                    <option value="EQUIPMENT">Medical Equipment</option>
                    <option value="SURGICAL">Surgical Supply</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="e.g. Tablets, Vials, Boxes"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Current Stock Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="e.g. 500"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Reorder Threshold *
                  </label>
                  <input
                    type="number"
                    value={formData.reorder_threshold}
                    onChange={(e) => setFormData({ ...formData, reorder_threshold: e.target.value })}
                    placeholder="e.g. 50"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Batch Number
                  </label>
                  <input
                    type="text"
                    value={formData.batch_number}
                    onChange={(e) => setFormData({ ...formData, batch_number: e.target.value })}
                    placeholder="e.g. BATCH-2026-X"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                    Unit Price (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="e.g. 15.50"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '10px 18px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-subtle)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 22px', borderRadius: 'var(--radius-md)', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
                >
                  {editItem ? 'Save Updates' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
