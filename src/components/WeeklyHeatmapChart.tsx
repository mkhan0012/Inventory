"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
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
        <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-main)' }}>{data.day}</p>
        <p style={{ margin: 0, color: '#3b82f6', fontSize: '14px', fontWeight: 600 }}>
          Revenue: ₹{data.sales.toLocaleString('en-IN', {minimumFractionDigits: 2})}
        </p>
      </div>
    );
  }
  return null;
};

export default function WeeklyHeatmapChart({ data }: { data: any[] }) {
  if (!data || data.length === 0 || data.every(d => d.sales === 0)) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        No day-of-week data available for this period.
      </div>
    );
  }

  const maxSales = Math.max(...data.map(d => d.sales));

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <defs>
            <linearGradient id="heatmapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity={1}/>
              <stop offset="100%" stopColor="#3B82F6" stopOpacity={0.8}/>
            </linearGradient>
            <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.1" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(0, 3)} tick={{fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500}} dy={10} />
          <YAxis tickFormatter={(val) => {
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
            return `₹${val}`;
          }} axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500}} dx={-10} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg-main)', opacity: 0.5}} />
          <Bar dataKey="sales" radius={[8, 8, 8, 8]}>
            {data.map((entry, index) => {
              const intensity = entry.sales === 0 ? 0.2 : 0.4 + (0.6 * (entry.sales / maxSales));
              return <Cell key={`cell-${index}`} fill="url(#heatmapGradient)" fillOpacity={intensity} filter="url(#barShadow)" />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
