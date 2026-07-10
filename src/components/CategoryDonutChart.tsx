"use client";
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function CategoryDonutChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        No category data available for this period.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value, payload: data } = payload[0];
      return (
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '12px 16px', 
          border: '1px solid rgba(255,255,255,0.3)', 
          borderRadius: '12px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.02)' 
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-main)' }}>{name}</p>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>Revenue: <span style={{color: 'var(--text-main)'}}>₹{value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span></p>
          <p style={{ margin: '4px 0 0 0', color: '#10b981', fontSize: '13px', fontWeight: 600 }}>Profit: ₹{data.profit.toLocaleString('en-IN', {minimumFractionDigits: 2})}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
