import React, { useState } from 'react';
import { Download, X, Smartphone, Sparkles, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, isIOS, installApp } = usePWAInstall();
  const [dismissed, setDismissed] = useState(
    localStorage.getItem('meditwin_pwa_dismissed') === 'true'
  );
  const [showIosGuide, setShowIosGuide] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('meditwin_pwa_dismissed', 'true');
  };

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIosGuide(true);
    } else {
      await installApp();
    }
  };

  return (
    <div
      className="pwa-install-banner animate-fade"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '20px',
        zIndex: 100,
        maxWidth: '380px',
        background: 'rgba(18, 24, 38, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px',
        boxShadow: '0 12px 36px rgba(0, 0, 0, 0.6), 0 0 24px rgba(59, 130, 246, 0.2)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            flexShrink: 0
          }}>
            <Smartphone size={22} />
          </div>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: '700', margin: 0, color: '#fff' }}>
              Install MediTwin-AI App
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '2px 0 0 0' }}>
              Add to home screen for instant offline access & app experience.
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Dismiss install prompt"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px'
          }}
        >
          <X size={18} />
        </button>
      </div>

      {showIosGuide && (
        <div style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '10px',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)'
        }}>
          Tap the <Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> <strong>Share</strong> button in Safari, then select <strong>'Add to Home Screen'</strong>.
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={handleDismiss}
          className="btn-secondary"
          style={{ fontSize: '0.8rem', padding: '6px 12px' }}
        >
          Later
        </button>
        <button
          onClick={handleInstallClick}
          className="btn-primary"
          style={{ fontSize: '0.8rem', padding: '6px 14px', gap: '6px' }}
        >
          <Download size={14} /> Install Now
        </button>
      </div>
    </div>
  );
}
