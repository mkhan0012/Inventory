"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const { name, value, payload: data } = payload[0];
    return (
      <div style={{ 
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '12px 16px', 
        border: '1px solid var(--border)', 
        borderRadius: '12px', 
        boxShadow: 'var(--shadow-card)' 
      }}>
        <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-main)' }}>{name}</p>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Revenue: <span style={{color: 'var(--text-main)'}}>₹{value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
        <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>Profit: ₹{data.profit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
      </div>
    );
  }
  return null;
};

export default function CategoryDonutChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        No category data available for this period.
      </div>
    );
  }

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={4}
            cornerRadius={8}
            dataKey="value"
            stroke="none"
            filter="url(#pieShadow)"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '13px', fontWeight: 500 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
