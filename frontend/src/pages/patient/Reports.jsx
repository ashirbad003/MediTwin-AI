import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  FileText, UploadCloud, AlertTriangle, CheckCircle, Clock, Eye, Trash2, 
  Sparkles, Activity, Download, RefreshCw, Layers, ShieldCheck, ChevronRight
} from 'lucide-react';

export default function PatientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [summaryMode, setSummaryMode] = useState('patient'); // 'patient' or 'doctor'
  const [reportType, setReportType] = useState('Blood Test');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await api.get('/reports/my-reports');
      setReports(res.data || []);
      if (res.data && res.data.length > 0 && !selectedReport) {
        setSelectedReport(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: 'error', text: 'Please select a PDF report file to upload.' });
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('report_type', reportType);

    try {
      const res = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage({ type: 'success', text: 'Report analyzed and parsed successfully!' });
      setFile(null);
      // Reset input
      const fileInput = document.getElementById('report-file-input');
      if (fileInput) fileInput.value = '';
      
      await fetchReports();
      setSelectedReport(res.data);
    } catch (err) {
      console.error('Upload failed', err);
      setMessage({ 
        type: 'error', 
        text: err.response?.data?.detail || 'Failed to analyze report. Ensure it is a valid PDF.' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await api.delete(`/reports/${reportId}`);
      setMessage({ type: 'success', text: 'Report removed.' });
      if (selectedReport?.id === reportId) {
        setSelectedReport(null);
      }
      fetchReports();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete report.' });
    }
  };

  return (
    <div style={{ padding: '28px', maxWidth: '1440px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--primary)', background: 'var(--primary-subtle)', padding: '3px 8px', borderRadius: '4px' }}>
              Multimodal Document Intelligence
            </span>
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>
            Medical Diagnostic Reports
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.95rem' }}>
            Upload lab tests, diagnostic scans, and clinical notes for AI biomarker extraction and explainable translation.
          </p>
        </div>
        <button 
          onClick={fetchReports}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', color: 'var(--text-main)', fontWeight: 600, cursor: 'pointer' }}
        >
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'} animate-fade`}>
          {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Upload Box */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px', marginBottom: '28px', boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={20} color="var(--primary)" /> Upload New Medical Report
        </h3>
        <form onSubmit={handleFileUpload} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Report Category
            </label>
            <select 
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.92rem' }}
            >
              <option value="Blood Test">Complete Blood Count / Metabolic Panel</option>
              <option value="Lipid Profile">Lipid Panel & Cholesterol</option>
              <option value="Cardiology">Cardiology / ECG / Echo Report</option>
              <option value="Endocrine / Diabetes">HbA1c & Fasting Glucose</option>
              <option value="Renal Function">Kidney Function Test (KFT)</option>
              <option value="Liver Function">Liver Function Test (LFT)</option>
              <option value="Radiology">Radiology / X-Ray / CT Scan Summary</option>
              <option value="Discharge Summary">Hospital Discharge Summary</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Select PDF Document
            </label>
            <input 
              id="report-file-input"
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-main)', fontSize: '0.88rem' }}
            />
          </div>

          <div>
            <button 
              type="submit" 
              disabled={uploading}
              style={{ 
                width: '100%', 
                padding: '11px 20px', 
                borderRadius: 'var(--radius-md)', 
                background: uploading ? 'var(--text-muted)' : 'var(--primary)', 
                color: '#fff', 
                border: 'none', 
                fontWeight: 700, 
                fontSize: '0.95rem',
                cursor: uploading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: 'var(--shadow-primary)'
              }}
            >
              {uploading ? (
                <>
                  <RefreshCw size={18} className="spin-animation" />
                  Extracting Biomarkers...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze Report with AI
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Main Reports Grid & Viewer */}
      <div className="grid-responsive-1-2">
        {/* Reports List */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '20px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0 0 16px 0', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>Reports Archive</span>
            <span style={{ fontSize: '0.8rem', background: 'var(--bg-input)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-muted)' }}>
              {reports.length} files
            </span>
          </h3>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <RefreshCw size={24} className="spin-animation" style={{ margin: '0 auto 8px' }} />
              <p style={{ margin: 0, fontSize: '0.9rem' }}>Loading archive...</p>
            </div>
          ) : reports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
              <FileText size={32} style={{ margin: '0 auto 10px', opacity: 0.5 }} />
              <p style={{ margin: '0 0 4px 0', fontWeight: 600, fontSize: '0.92rem' }}>No Reports Yet</p>
              <p style={{ margin: 0, fontSize: '0.82rem' }}>Upload your first diagnostic PDF above to see extracted biomarkers.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {reports.map((rep) => {
                const isSelected = selectedReport?.id === rep.id;
                
                // Dynamically derive abnormal and critical count from extracted_data or structured_data
                const extractedData = rep.extracted_data || rep.structured_data?.lab_results || {};
                const items = Array.isArray(extractedData) 
                  ? extractedData 
                  : Object.values(extractedData);
                
                const abnormalCount = items.filter(it => {
                  const s = String(it.status || it.flag || '').toLowerCase();
                  return s.includes('high') || s.includes('low') || s.includes('abnormal') || it.is_abnormal;
                }).length;

                const rawStatus = rep.status || rep.risk_level || '';
                const isCritical = rawStatus.toLowerCase() === 'critical' || items.some(it => String(it.status || '').toLowerCase().includes('critical'));
                const isAttentionReq = rawStatus.toLowerCase() === 'attention required' || abnormalCount > 0;

                let statusBadgeText = 'Normal';
                let badgeStyle = { 
                  fontSize: '0.72rem', 
                  fontWeight: 700, 
                  background: 'rgba(16, 185, 129, 0.12)', 
                  color: '#10b981', 
                  border: '1px solid rgba(16, 185, 129, 0.3)', 
                  padding: '2px 8px', 
                  borderRadius: '4px' 
                };

                if (isCritical) {
                  statusBadgeText = 'Critical';
                  badgeStyle = { 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    background: 'rgba(239, 68, 68, 0.2)', 
                    color: '#f87171', 
                    border: '1px solid #ef4444', 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                  };
                } else if (isAttentionReq) {
                  statusBadgeText = 'Attention Required';
                  badgeStyle = { 
                    fontSize: '0.72rem', 
                    fontWeight: 700, 
                    background: 'rgba(245, 158, 11, 0.15)', 
                    color: '#fbbf24', 
                    border: '1px solid rgba(245, 158, 11, 0.35)', 
                    padding: '2px 8px', 
                    borderRadius: '4px' 
                  };
                }

                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep)}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                      background: isSelected ? 'var(--primary-subtle)' : 'var(--bg-card)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.92rem', color: isSelected ? 'var(--primary)' : 'var(--text-main)' }}>
                        {rep.report_type || 'Diagnostic Report'}
                      </span>
                      <span style={badgeStyle}>
                        {statusBadgeText}
                      </span>
                    </div>
                    <p style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {rep.file_name}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>{new Date(rep.created_at).toLocaleDateString()}</span>
                      <ChevronRight size={14} color={isSelected ? 'var(--primary)' : 'var(--text-muted)'} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Report Detail & AI Extractor View */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
          {!selectedReport ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Activity size={48} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                Select a Report to View AI Analysis
              </h3>
              <p style={{ margin: 0, fontSize: '0.9rem', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto' }}>
                View extracted biomarkers, reference range comparisons, and dual-mode clinical translations.
              </p>
            </div>
          ) : (
            <div>
              {/* Report Header */}
              {(() => {
                const selExtracted = selectedReport.extracted_data || selectedReport.structured_data?.lab_results || {};
                const selItems = Array.isArray(selExtracted) ? selExtracted : Object.values(selExtracted);
                const selAbnormal = selItems.filter(it => {
                  const s = String(it.status || it.flag || '').toLowerCase();
                  return s.includes('high') || s.includes('low') || s.includes('abnormal') || it.is_abnormal;
                }).length;
                const selRaw = selectedReport.status || selectedReport.risk_level || '';
                const selCritical = selRaw.toLowerCase() === 'critical' || selItems.some(it => String(it.status || '').toLowerCase().includes('critical'));
                const selAttention = selRaw.toLowerCase() === 'attention required' || selAbnormal > 0;

                let selStatusText = 'Normal';
                let selBadgeStyle = {
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  background: 'rgba(16, 185, 129, 0.12)',
                  color: '#10b981',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  padding: '3px 10px',
                  borderRadius: '6px'
                };

                if (selCritical) {
                  selStatusText = 'Critical';
                  selBadgeStyle = {
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    border: '1px solid #ef4444',
                    padding: '3px 10px',
                    borderRadius: '6px'
                  };
                } else if (selAttention) {
                  selStatusText = 'Attention Required';
                  selBadgeStyle = {
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    background: 'rgba(245, 158, 11, 0.15)',
                    color: '#fbbf24',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    padding: '3px 10px',
                    borderRadius: '6px'
                  };
                }

                return (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: 'var(--text-main)' }}>
                          {selectedReport.report_type}
                        </h2>
                        <span style={{ fontSize: '0.8rem', padding: '2px 8px', borderRadius: '6px', background: 'var(--bg-input)', color: 'var(--text-secondary)', fontWeight: 600 }}>
                          ID: #{selectedReport.id}
                        </span>
                        <span style={selBadgeStyle}>
                          {selStatusText}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Original File: <strong>{selectedReport.file_name}</strong> • Uploaded: {new Date(selectedReport.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleDeleteReport(selectedReport.id)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 'var(--radius-md)', color: '#e11d48', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                      >
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>
                );
              })()}

              {/* AI Summary Tabs */}
              <div style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-lg)', padding: '18px', border: '1px solid var(--border)', marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={20} color="var(--primary)" />
                    <span style={{ fontWeight: 800, fontSize: '1.02rem', color: 'var(--text-main)' }}>
                      Explainable AI Report Summary
                    </span>
                  </div>
                  <div style={{ display: 'flex', background: 'var(--bg-card)', padding: '3px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    <button
                      onClick={() => setSummaryMode('patient')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: summaryMode === 'patient' ? 'var(--primary)' : 'transparent',
                        color: summaryMode === 'patient' ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Patient Friendly
                    </button>
                    <button
                      onClick={() => setSummaryMode('doctor')}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        background: summaryMode === 'doctor' ? 'var(--primary)' : 'transparent',
                        color: summaryMode === 'doctor' ? '#fff' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      Doctor Technical
                    </button>
                  </div>
                </div>

                <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '0.92rem', lineHeight: '1.65', color: 'var(--text-main)' }}>
                  {summaryMode === 'patient' ? (
                    <div>
                      <p style={{ margin: '0 0 10px 0' }}>
                        {selectedReport.summary_patient || selectedReport.ai_summary || "No simplified summary available."}
                      </p>
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <ShieldCheck size={16} color="var(--primary)" />
                        <span>This summary is generated for educational clarity. Always review abnormal findings with your physician.</span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p style={{ margin: '0 0 10px 0', fontFamily: 'monospace', fontSize: '0.88rem' }}>
                        {selectedReport.summary_doctor || selectedReport.ai_summary || "No clinical technical summary available."}
                      </p>
                      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Layers size={16} color="var(--primary)" />
                        <span>Includes automated reference range cross-matching and multi-biomarker flag correlation.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Extracted Biomarkers Table */}
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 14px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={18} color="var(--primary)" /> Extracted Biomarkers & Lab Values
                </h3>

                {(() => {
                  const labResults = selectedReport.extracted_data || selectedReport.structured_data?.lab_results || {};
                  const entries = Array.isArray(labResults)
                    ? labResults.map((item, idx) => [item.parameter || item.name || `param_${idx}`, item])
                    : Object.entries(labResults);

                  if (entries.length === 0) {
                    return (
                      <div style={{ padding: '24px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <FileText size={24} style={{ margin: '0 auto 8px', opacity: 0.5 }} />
                        <p style={{ margin: 0, fontSize: '0.88rem' }}>No structured tabular values parsed for this document.</p>
                      </div>
                    );
                  }

                  return (
                    <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                        <thead>
                          <tr style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Test / Parameter</th>
                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Observed Value</th>
                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Reference Range</th>
                            <th style={{ padding: '12px 16px', fontWeight: 700 }}>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {entries.map(([key, item], idx) => {
                            const valObj = typeof item === 'object' && item !== null ? item : { value: item, unit: '', reference_range: 'Normal', status: 'Normal' };
                            const status = valObj.status || (valObj.is_abnormal ? 'Abnormal' : 'Normal');
                            const isHigh = String(status).toLowerCase().includes('high');
                            const isLow = String(status).toLowerCase().includes('low');
                            const isCritical = String(status).toLowerCase().includes('critical');
                            const isNormal = String(status).toLowerCase().includes('normal') && !isHigh && !isLow && !isCritical;
                            const refRange = valObj.reference_range || valObj.normal_range || 'N/A';
                            const isFallback = valObj.is_source_range === false;

                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid var(--border)', background: idx % 2 === 0 ? 'transparent' : 'var(--bg-subtle)' }}>
                                <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-main)' }}>
                                  {valObj.name || valObj.parameter || key}
                                </td>
                                <td style={{ padding: '12px 16px', fontWeight: 700, color: isNormal ? 'var(--text-main)' : (isCritical ? '#f87171' : '#fbbf24') }}>
                                  {valObj.value ?? '—'} {valObj.unit || ''}
                                </td>
                                <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                  <span>{refRange}</span>
                                  {isFallback && (
                                    <span style={{ marginLeft: '6px', fontSize: '0.7rem', color: 'var(--text-muted)', background: 'var(--bg-input)', padding: '2px 5px', borderRadius: '4px' }}>
                                      Standard Fallback
                                    </span>
                                  )}
                                </td>
                                <td style={{ padding: '12px 16px' }}>
                                  <span style={{
                                    padding: '3px 10px',
                                    borderRadius: '12px',
                                    fontSize: '0.78rem',
                                    fontWeight: 700,
                                    background: isNormal ? 'rgba(16, 185, 129, 0.12)' : (isCritical ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.15)'),
                                    color: isNormal ? '#10b981' : (isCritical ? '#f87171' : '#fbbf24'),
                                    border: `1px solid ${isNormal ? 'rgba(16, 185, 129, 0.3)' : (isCritical ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.35)')}`
                                  }}>
                                    {status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

              {/* Raw Extracted Text Viewer */}
              {selectedReport.extracted_text && (
                <div style={{ marginTop: '24px' }}>
                  <details style={{ background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--border)' }}>
                    <summary style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      View Raw OCR / Extracted Text
                    </summary>
                    <pre style={{ marginTop: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.8rem', background: 'var(--bg-card)', padding: '14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', color: 'var(--text-main)', maxHeight: '250px', overflowY: 'auto' }}>
                      {selectedReport.extracted_text}
                    </pre>
                  </details>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
