"use client";
import React from 'react';
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';

interface ChartData {
  name: string;
  income: number;
  expenses: number;
  profit: number;
}

export default function MonthlyComparisonChart({ data }: { data: ChartData[] }) {
  const formatYAxis = (value: number) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
    return `₹${value}`;
  };

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          }}
        >
          <defs>
            <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.3}/>
            </linearGradient>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.9}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.3}/>
            </linearGradient>
            <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.2" />
            </filter>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.6} strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontWeight: 500}} dy={10} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)', fontWeight: 500}} dx={-10} tickFormatter={formatYAxis} />
          <Tooltip 
            formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN', {minimumFractionDigits: 2})}`} 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid var(--border)', 
              boxShadow: 'var(--shadow-hover)', 
              background: 'var(--bg-card)',
              backdropFilter: 'blur(12px)',
              padding: '12px 16px'
            }}
            labelStyle={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '13px', marginBottom: '8px' }}
            itemStyle={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '14px', paddingTop: '4px' }}
            cursor={{ fill: 'var(--primary-glow)', opacity: 0.5 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }} iconType="circle" />
          <Bar dataKey="income" name="Total Income" barSize={24} fill="url(#colorInc)" radius={[8, 8, 8, 8]} />
          <Bar dataKey="expenses" name="Total Expenses" barSize={24} fill="url(#colorExp)" radius={[8, 8, 8, 8]} />
          <Line type="monotone" dataKey="profit" name="Net Profit Trend" stroke="#3B82F6" strokeWidth={4} filter="url(#lineShadow)" dot={{ r: 5, strokeWidth: 0, fill: '#3B82F6' }} activeDot={{ r: 8, strokeWidth: 0, fill: '#3B82F6' }} />
          <Brush dataKey="name" height={30} stroke="var(--border)" fill="transparent" tickFormatter={() => ''} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
