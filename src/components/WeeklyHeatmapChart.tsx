"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function WeeklyHeatmapChart({ data }: { data: any[] }) {
  if (!data || data.length === 0 || data.every(d => d.sales === 0)) {
    return (
      <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
        No day-of-week data available for this period.
      </div>
    );
  }

  const maxSales = Math.max(...data.map(d => d.sales));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{data.day}</p>
          <p style={{ margin: 0, color: '#3b82f6', fontSize: '13px' }}>
            Revenue: ₹{data.sales.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="day" axisLine={false} tickLine={false} tickFormatter={(val) => val.substring(0, 3)} tick={{fill: '#6b7280', fontSize: 12}} />
          <YAxis tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
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
