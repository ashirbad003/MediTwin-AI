import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = FolderOpen,
  title = 'No records found',
  description = 'There are no active records in this view.',
  actionLabel,
  actionTo,
  onAction,
  actionIcon: ActionIcon
}) {
  return (
    <div
      className="glass-card animate-fade"
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        background: 'rgba(18, 24, 38, 0.5)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)'
        }}
      >
        <Icon size={28} />
      </div>
      <div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>
          {title}
        </h3>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: 0 }}>
          {description}
        </p>
      </div>
      {(actionLabel && actionTo) && (
        <Link to={actionTo} className="btn-primary" style={{ marginTop: '6px', fontSize: '0.85rem', padding: '8px 16px' }}>
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </Link>
      )}
      {(actionLabel && onAction && !actionTo) && (
        <button onClick={onAction} className="btn-primary" style={{ marginTop: '6px', fontSize: '0.85rem', padding: '8px 16px' }}>
          {ActionIcon && <ActionIcon size={16} />}
          {actionLabel}
        </button>
      )}
    </div>
  );
}
