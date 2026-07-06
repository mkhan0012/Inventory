import React from 'react';
import './page.css';

export default function DashboardLoading() {
  return (
    <div className="dashboard animate-fade-in-up" style={{ opacity: 1 }}>
      <div className="dashboard-header">
        <div style={{ height: 32, width: 200, background: 'var(--border)', borderRadius: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
        <div style={{ height: 36, width: 150, background: 'var(--border)', borderRadius: 8, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      </div>

      <div style={{ height: 50, width: '100%', background: 'var(--border)', borderRadius: 12, marginBottom: 24, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      <div style={{ height: 24, width: 150, background: 'var(--border)', borderRadius: 6, marginBottom: 12, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />
      
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '32px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card" style={{ height: 120, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: 'var(--border)', border: 'none' }} />
        ))}
      </div>

      <div style={{ height: 24, width: 180, background: 'var(--border)', borderRadius: 6, marginBottom: 12, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }} />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card" style={{ height: 120, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: 'var(--border)', border: 'none' }} />
        ))}
      </div>

      <div className="middle-grid">
        <div className="card" style={{ minHeight: 350, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: 'var(--border)', border: 'none' }} />
        <div className="side-column">
          <div className="card" style={{ minHeight: 350, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: 'var(--border)', border: 'none' }} />
        </div>
      </div>
      
      <div className="bottom-grid">
        <div className="card" style={{ gridColumn: '1 / -1', minHeight: 250, animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite', background: 'var(--border)', border: 'none' }} />
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .4; }
        }
      `}</style>
    </div>
  );
}
