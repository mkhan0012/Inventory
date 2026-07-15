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
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(0, 3)} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
          <YAxis tickFormatter={(val) => {
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
            return `₹${val}`;
          }} axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg-main)', opacity: 0.5}} />
          <Bar dataKey="sales" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => {
              const opacity = entry.sales === 0 ? 0.2 : 0.3 + (0.7 * (entry.sales / maxSales));
              return <Cell key={`cell-${index}`} fill={`rgba(59, 130, 246, ${opacity})`} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
