"use client";
import React from 'react';
import './StatCard.css';
import CountUp from './CountUp';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface StatCardProps {
  title: string;
  value?: string;
  numericValue?: number;
  prefix?: string;
  decimals?: number;
  trend?: string;
  trendUp?: boolean;
  icon?: React.ReactNode;
  iconBg?: string;
  trendLabel?: string;
  sparklineData?: { value: number }[];
  onClick?: () => void;
  isActive?: boolean;
}

export default function StatCard({ title, value, numericValue, prefix, decimals = 0, trend, trendUp, icon, iconBg, trendLabel, sparklineData, onClick, isActive }: StatCardProps) {
  return (
    <div 
      className={`card stat-card ${isActive ? 'active' : ''} ${onClick ? 'clickable' : ''}`} 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        padding: '20px', 
        cursor: onClick ? 'pointer' : 'default',
        border: isActive ? '2px solid var(--primary, #2962ff)' : '1px solid var(--border)',
        boxShadow: isActive ? '0 4px 12px rgba(41, 98, 255, 0.15)' : 'var(--shadow-sm)',
        transition: 'all 0.2s ease-in-out'
      }}
      onClick={onClick}
    >
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        {icon && (
          <div className="stat-icon-wrapper" style={{ color: iconBg ? iconBg.replace('0.1)', '1)') : 'var(--text-muted)' }}>
            {icon}
          </div>
        )}
      </div>
      
      <div className="stat-content" style={{ position: 'relative', zIndex: 2, marginTop: '8px' }}>
        <p className="stat-value">
          {numericValue !== undefined ? (
            <CountUp value={numericValue} prefix={prefix} decimals={decimals} />
          ) : (
            value
          )}
        </p>
        
        {(trend || trendLabel) && (
          <div className={`stat-trend ${trendUp ? 'text-success' : 'text-danger'}`}>
            {trendUp !== undefined && <span className="trend-arrow">{trendUp ? '↑' : '↓'}</span>}
            {trend && <span className="trend-value">{trend}</span>}
            {trendLabel && <span className="trend-label"> {trendLabel}</span>}
          </div>
        )}
      </div>
      
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40px', zIndex: 1, opacity: 0.2 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke={trendUp ? 'var(--success)' : 'var(--danger)'} strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
