"use client";

import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import SalesChart from './SalesChart';

interface DashboardSalesChartProps {
  data: {
    month: any[];
    sixMonths: any[];
    year: any[];
  }
}

export default function DashboardSalesChart({ data }: DashboardSalesChartProps) {
  const [timeRange, setTimeRange] = useState<'month' | 'sixMonths' | 'year'>('month');

  return (
    <div className="card" style={{ minHeight: '350px' }}>
      <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
         <h3 className="card-title">Sales Overview</h3>
         
         <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-main)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border)' }}>
            <button 
              onClick={() => setTimeRange('month')}
              style={{ 
                padding: '4px 12px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: timeRange === 'month' ? 'var(--primary)' : 'transparent',
                color: timeRange === 'month' ? 'white' : 'var(--text-muted)'
              }}
            >
              Month
            </button>
            <button 
              onClick={() => setTimeRange('sixMonths')}
              style={{ 
                padding: '4px 12px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: timeRange === 'sixMonths' ? 'var(--primary)' : 'transparent',
                color: timeRange === 'sixMonths' ? 'white' : 'var(--text-muted)'
              }}
            >
              6 Months
            </button>
            <button 
              onClick={() => setTimeRange('year')}
              style={{ 
                padding: '4px 12px', fontSize: '12px', fontWeight: 500, borderRadius: '4px', border: 'none', cursor: 'pointer',
                background: timeRange === 'year' ? 'var(--primary)' : 'transparent',
                color: timeRange === 'year' ? 'white' : 'var(--text-muted)'
              }}
            >
              Year
            </button>
         </div>
      </div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16, padding: '0 24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
           <div style={{ width: 12, height: 4, backgroundColor: '#2962ff', borderRadius: 2 }}></div> Sales
         </div>
         <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 500 }}>
           <div style={{ width: 12, height: 4, backgroundColor: '#10b981', borderRadius: 2 }}></div> Profit
         </div>
      </div>
      <div style={{ padding: '0 24px 24px 24px' }}>
        <SalesChart data={data[timeRange]} />
      </div>
    </div>
  );
}
