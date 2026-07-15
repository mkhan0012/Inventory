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
              <stop offset="5%" stopColor="#10b981" stopOpacity={1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.6}/>
            </linearGradient>
            <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={1}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.6}/>
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--border)" strokeOpacity={0.4} strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} tickFormatter={formatYAxis} />
          <Tooltip 
            formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN', {minimumFractionDigits: 2})}`} 
            contentStyle={{ 
              borderRadius: '12px', 
              border: '1px solid var(--border)', 
              boxShadow: '0 10px 40px rgba(0,0,0,0.08)', 
              background: 'var(--bg-card)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)'
            }}
            labelStyle={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}
            itemStyle={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '14px' }}
            cursor={{ fill: 'var(--bg-main)', opacity: 0.5 }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="income" name="Total Income" barSize={32} fill="url(#colorInc)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Total Expenses" barSize={32} fill="url(#colorExp)" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="profit" name="Net Profit Trend" stroke="#2962ff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#2962ff' }} activeDot={{ r: 6, strokeWidth: 0, fill: '#2962ff' }} />
          <Brush dataKey="name" height={30} stroke="var(--border)" fill="transparent" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
