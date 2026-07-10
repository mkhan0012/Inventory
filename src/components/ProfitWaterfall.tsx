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
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          padding: '12px 16px', 
          border: '1px solid rgba(255,255,255,0.3)', 
          borderRadius: '12px', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.08), 0 2px 10px rgba(0,0,0,0.02)' 
        }}>
          <p style={{ margin: '0 0 6px 0', fontWeight: 600, color: 'var(--text-main)' }}>{data.name}</p>
          <p style={{ margin: 0, fontWeight: 600, color: data.displayValue < 0 ? '#ef4444' : '#10b981' }}>
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
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={1}/>
            </linearGradient>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#2962ff" stopOpacity={1}/>
              <stop offset="95%" stopColor="#2962ff" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
          <YAxis tickFormatter={(val) => {
            if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
            if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
            return `₹${val}`;
          }} axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontSize: 12}} />
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'var(--bg-main)', opacity: 0.5}} />
          <Bar dataKey="transparent" stackId="a" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="positive" stackId="a" fill="url(#colorPositive)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="negative" stackId="a" fill="url(#colorNegative)" radius={[0, 0, 4, 4]} />
          <Bar dataKey="total" stackId="a" fill="url(#colorTotal)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
