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
  trend: string;
  trendUp: boolean;
  icon: React.ReactNode;
  iconBg: string;
  trendLabel?: string;
  sparklineData?: { value: number }[];
}

export default function StatCard({ title, value, numericValue, prefix, decimals = 0, trend, trendUp, icon, iconBg, trendLabel, sparklineData }: StatCardProps) {
  return (
    <div className="card stat-card" style={{ position: 'relative', overflow: 'hidden' }}>
      <div className="stat-content" style={{ position: 'relative', zIndex: 2 }}>
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">
          {numericValue !== undefined ? (
            <CountUp value={numericValue} prefix={prefix} decimals={decimals} />
          ) : (
            value
          )}
        </p>
        <div className={`stat-trend ${trendUp ? 'text-success' : 'text-danger'}`}>
          <span className="trend-arrow">{trendUp ? '▲' : '▼'}</span>
          {trend && <span>{trend}</span>}
          {trendLabel && <span className="trend-label"> {trendLabel}</span>}
        </div>
      </div>
      <div className="stat-icon-wrapper" style={{ backgroundColor: iconBg, position: 'relative', zIndex: 2 }}>
        {icon}
      </div>
      {sparklineData && sparklineData.length > 0 && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', zIndex: 1, opacity: 0.15 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklineData}>
              <Line type="monotone" dataKey="value" stroke={trendUp ? 'var(--success)' : 'var(--danger)'} strokeWidth={3} dot={false} isAnimationActive={true} animationDuration={1500} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
