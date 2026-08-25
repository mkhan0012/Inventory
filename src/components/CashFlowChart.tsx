"use client";
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CashFlowData {
  date: string;
  incoming: number;
  outgoing: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
}

export default function CashFlowChart({ data }: CashFlowChartProps) {
  if (data.length === 0) return null;

  return (
    <div style={{ width: '100%', height: '350px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.05}/>
            </linearGradient>
            <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#EF4444" stopOpacity={0.6}/>
              <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05}/>
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.15" />
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
            dy={10}
          />
          <YAxis 
            tick={{ fill: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}
            axisLine={false}
            tickLine={false}
            dx={-10}
            tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--bg-card)', 
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: 'var(--shadow-hover)',
              color: 'var(--text-main)',
              fontWeight: 600,
              padding: '12px 16px',
            }}
            itemStyle={{ fontWeight: 600, paddingTop: '4px' }}
            cursor={{ stroke: 'var(--border)', strokeWidth: 1, strokeDasharray: '4 4' }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="incoming" 
            name="Incoming Payments"
            stroke="#10B981" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorIncoming)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981', filter: 'url(#shadow)' }}
          />
          <Area 
            type="monotone" 
            dataKey="outgoing" 
            name="Outgoing & Expenses"
            stroke="#EF4444" 
            strokeWidth={4}
            fillOpacity={1} 
            fill="url(#colorOutgoing)" 
            activeDot={{ r: 6, strokeWidth: 0, fill: '#EF4444', filter: 'url(#shadow)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
