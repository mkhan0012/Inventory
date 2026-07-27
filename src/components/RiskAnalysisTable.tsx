"use client";
import React from 'react';
import { AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Receivable {
  id: string;
  name: string;
  dueAmount: number;
  creditLimit: number;
  riskPercentage: number;
}

interface Payable {
  id: string;
  name: string;
  dueAmount: number;
}

interface RiskAnalysisTableProps {
  data: {
    receivables: Receivable[];
    payables: Payable[];
  };
}

export default function RiskAnalysisTable({ data }: RiskAnalysisTableProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px' }}>
      
      {/* Receivables (Customers owing money) */}
      <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '6px', borderRadius: '8px' }}>
            <ArrowUpRight size={20} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Receivables Risk (Action Required)</h3>
        </div>
        
        {data.receivables.length === 0 ? (
           <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
             No outstanding customer dues. Excellent!
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.receivables.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: r.riskPercentage >= 90 ? '3px solid var(--danger)' : r.riskPercentage >= 70 ? '3px solid var(--warning)' : '3px solid var(--success)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {r.name}
                    {r.riskPercentage >= 90 && <AlertCircle size={14} color="var(--danger)" />}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Limit: ₹{r.creditLimit.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 'bold', color: r.riskPercentage >= 90 ? 'var(--danger)' : 'var(--text-main)', fontSize: '13px' }}>
                    ₹{r.dueAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <div style={{ fontSize: '11px', color: r.riskPercentage >= 90 ? 'var(--danger)' : r.riskPercentage >= 70 ? 'var(--warning)' : 'var(--success)', marginTop: '2px' }}>
                    {r.riskPercentage.toFixed(1)}% of limit
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payables (Money we owe suppliers) */}
      <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', padding: '6px', borderRadius: '8px' }}>
            <ArrowDownRight size={20} />
          </div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-main)' }}>Payables (Outstanding to Suppliers)</h3>
        </div>
        
        {data.payables.length === 0 ? (
           <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
             No outstanding supplier dues. Great!
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.payables.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--bg-card)', borderRadius: '8px', borderLeft: '3px solid var(--border)' }}>
                <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-main)' }}>
                  {p.name}
                </div>
                <div style={{ fontWeight: 'bold', color: 'var(--warning)', fontSize: '13px' }}>
                  ₹{p.dueAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
