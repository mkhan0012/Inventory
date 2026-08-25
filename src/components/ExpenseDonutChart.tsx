"use client";

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['#2962ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

interface Expense {
  category: string;
  amount: number;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '12px 16px',
        boxShadow: 'var(--shadow-hover)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: payload[0].payload.fill, boxShadow: `0 0 8px ${payload[0].payload.fill}` }} />
          <span style={{ color: 'var(--text-main)', fontSize: '14px', fontWeight: 600 }}>
            {payload[0].name}: ₹{payload[0].value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
          </span>
        </div>
      </div>
    );
  }
  return null;
};

export default function ExpenseDonutChart({ expenses }: { expenses: Expense[] }) {
  if (!expenses || expenses.length === 0) return null;

  // Group by category
  const grouped = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.keys(grouped).map(key => ({
    name: key,
    value: grouped[key]
  })).sort((a, b) => b.value - a.value);

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <PieChart>
          <defs>
            <filter id="expensePieShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodOpacity="0.15" />
            </filter>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={4}
            cornerRadius={8}
            dataKey="value"
            stroke="none"
            filter="url(#expensePieShadow)"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px', fontWeight: 500 }} iconType="circle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
