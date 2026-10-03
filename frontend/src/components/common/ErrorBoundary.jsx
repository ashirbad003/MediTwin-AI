import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[MediTwin-AI Error Boundary Caught]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '400px',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: '16px'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185'
            }}
          >
            <AlertTriangle size={32} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', margin: '0 0 8px 0' }}>
              Interface Rendering Interrupted
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '460px', margin: 0 }}>
              An unexpected error occurred while loading this clinical view. Your data is secure on the backend server.
            </p>
          </div>
          <button
            onClick={this.handleReset}
            className="btn-primary"
            style={{ marginTop: '8px', gap: '8px' }}
          >
            <RefreshCw size={16} /> Reload Interface
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
