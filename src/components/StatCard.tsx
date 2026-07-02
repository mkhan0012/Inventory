import React from 'react';
import './StatCard.css';

interface StatCardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBg: string;
  trendLabel?: string;
}

export default function StatCard({ title, value, trend, trendUp, icon, iconBg, trendLabel }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <div className={`stat-trend ${trendUp ? 'text-success' : 'text-danger'}`}>
          <span className="trend-arrow">{trendUp ? '▲' : '▼'}</span>
          {trend && <span>{trend}</span>}
          {trendLabel && <span className="trend-label"> {trendLabel}</span>}
        </div>
      </div>
      <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg }}>
        {icon}
      </div>
    </div>
  );
}
