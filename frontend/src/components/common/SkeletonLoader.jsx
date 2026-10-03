import React from 'react';

export function SkeletonBox({ width = '100%', height = '20px', borderRadius = 'var(--radius-sm)', style = {} }) {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        background: 'rgba(255, 255, 255, 0.05)',
        ...style
      }}
    />
  );
}

export function DashboardCardsSkeleton({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, idx) => (
        <div key={idx} className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <SkeletonBox width="60%" height="16px" />
            <SkeletonBox width="28px" height="28px" borderRadius="8px" />
          </div>
          <SkeletonBox width="45%" height="32px" />
          <SkeletonBox width="80%" height="14px" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="glass-card" style={{ padding: '16px', overflowX: 'auto' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
        {Array.from({ length: cols }).map((_, idx) => (
          <SkeletonBox key={idx} width={`${100 / cols}%`} height="18px" />
        ))}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} style={{ display: 'flex', gap: '16px' }}>
            {Array.from({ length: cols }).map((_, colIdx) => (
              <SkeletonBox key={colIdx} width={`${100 / cols}%`} height="24px" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
