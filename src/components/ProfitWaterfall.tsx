"use client";
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ProfitWaterfall({ data }: { data: any[] }) {
  let currentTotal = 0;
  
  const chartData = data.map((step, index) => {
    const isNegative = step.value < 0;
    const absValue = Math.abs(step.value);
    
    let transparent = 0;
    let positive = 0;
    let negative = 0;
    let total = 0;
    
    if (step.isTotal || index === 0) {
      total = absValue;
      if (index === 0) currentTotal = absValue;
      else currentTotal = step.value;
    } else {
      if (isNegative) {
        currentTotal -= absValue;
        transparent = currentTotal;
        negative = absValue;
      } else {
        transparent = currentTotal;
        positive = absValue;
        currentTotal += absValue;
      }
    }
    
    return {
      name: step.name,
      transparent,
      positive,
      negative,
      total,
      displayValue: step.value
    };
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: '#fff', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{data.name}</p>
          <p style={{ margin: 0, color: data.displayValue < 0 ? '#ef4444' : '#10b981' }}>
            {data.displayValue < 0 ? '-' : ''}₹{Math.abs(data.displayValue).toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ height: '300px', width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
          <YAxis tickFormatter={(val) => `₹${val}`} axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0,0,0,0.05)'}} />
          <Bar dataKey="transparent" stackId="a" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="positive" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" stackId="a" fill="#ef4444" radius={[0, 0, 4, 4]} />
          <Bar dataKey="total" stackId="a" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
