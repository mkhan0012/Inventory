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
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
          <XAxis 
            dataKey="date" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            minTickGap={30}
          />
          <YAxis 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(1) + 'k' : value}`}
          />
          <Tooltip 
            contentStyle={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border)',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              color: 'var(--text-main)'
            }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, '']}
          />
          <Area 
            type="monotone" 
            dataKey="incoming" 
            name="Incoming Payments"
            stroke="#10b981" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorIncoming)" 
          />
          <Area 
            type="monotone" 
            dataKey="outgoing" 
            name="Outgoing & Expenses"
            stroke="#ef4444" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorOutgoing)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
