import React from 'react';
import './page.css';

export default function DashboardLoading() {
  return (
    <div className="dashboard animate-fade-in-up" style={{ opacity: 1 }}>
      <div className="dashboard-header">
        <div className="skeleton" style={{ height: 32, width: 200, borderRadius: 8 }} />
        <div className="skeleton" style={{ height: 36, width: 150, borderRadius: 8 }} />
      </div>

      <div className="skeleton" style={{ height: 50, width: '100%', borderRadius: 12, marginBottom: 24 }} />

      <div className="skeleton" style={{ height: 24, width: 150, borderRadius: 6, marginBottom: 12 }} />
      
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '32px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} className="card skeleton" style={{ height: 120, border: 'none' }} />
        ))}
      </div>

      <div className="skeleton" style={{ height: 24, width: 180, borderRadius: 6, marginBottom: 12 }} />

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="card skeleton" style={{ height: 120, border: 'none' }} />
        ))}
      </div>

      <div className="middle-grid">
        <div className="card skeleton" style={{ minHeight: 350, border: 'none' }} />
        <div className="side-column">
          <div className="card skeleton" style={{ minHeight: 350, border: 'none' }} />
        </div>
      </div>
      
      <div className="bottom-grid">
        <div className="card skeleton" style={{ gridColumn: '1 / -1', minHeight: 250, border: 'none' }} />
      </div>
    </div>
  );
}
