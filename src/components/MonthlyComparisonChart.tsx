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
  ResponsiveContainer
} from 'recharts';

interface ChartData {
  name: string;
  income: number;
  expenses: number;
  profit: number;
}

export default function MonthlyComparisonChart({ data }: { data: ChartData[] }) {
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
          <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} />
          <YAxis axisLine={false} tickLine={false} tick={{fill: 'var(--text-muted)'}} tickFormatter={(val) => `₹${val}`} />
          <Tooltip 
            formatter={(value: any) => `₹${Number(value).toFixed(2)}`} 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="income" name="Total Income" barSize={32} fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Total Expenses" barSize={32} fill="#ef4444" radius={[4, 4, 0, 0]} />
          <Line type="monotone" dataKey="profit" name="Net Profit Trend" stroke="#2962ff" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
