import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function ClinicalDisclaimer({ compact = false }) {
  if (compact) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          padding: '6px 0'
        }}
      >
        <ShieldAlert size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
        <span>AI-assisted decision support. Does not replace professional medical judgment.</span>
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: '28px',
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: 'rgba(245, 158, 11, 0.06)',
        border: '1px solid rgba(245, 158, 11, 0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '0.8rem',
        color: 'var(--text-secondary)'
      }}
    >
      <ShieldAlert size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
      <span>
        <strong>Clinical AI Disclaimer:</strong> MediTwin-AI provides AI-assisted health risk estimation and decision support based on validated clinical guidelines. It is designed to assist physicians and patients, and does not replace individualized clinical diagnostic evaluation.
      </span>
    </div>
  );
}
