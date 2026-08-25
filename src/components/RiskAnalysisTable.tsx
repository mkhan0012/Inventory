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
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: 'var(--danger-glow)', color: 'var(--danger)', padding: '8px', borderRadius: '10px' }}>
            <ArrowUpRight size={20} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Receivables Risk (Action Required)</h3>
        </div>
        
        {data.receivables.length === 0 ? (
           <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
             No outstanding customer dues. Excellent!
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.receivables.map(r => (
              <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '12px', borderLeft: r.riskPercentage >= 90 ? '4px solid var(--danger)' : r.riskPercentage >= 70 ? '4px solid var(--warning)' : '4px solid var(--success)', transition: 'transform 0.2s ease', cursor: 'default' }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {r.name}
                    {r.riskPercentage >= 90 && <AlertCircle size={14} color="var(--danger)" />}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', fontWeight: 500 }}>
                    Limit: ₹{r.creditLimit.toLocaleString('en-IN', {maximumFractionDigits: 0})}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: r.riskPercentage >= 90 ? 'var(--danger)' : 'var(--text-main)', fontSize: '14px' }}>
                    ₹{r.dueAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </div>
                  <div style={{ fontSize: '12px', color: r.riskPercentage >= 90 ? 'var(--danger)' : r.riskPercentage >= 70 ? 'var(--warning)' : 'var(--success)', marginTop: '4px', fontWeight: 600, background: r.riskPercentage >= 90 ? 'var(--danger-glow)' : r.riskPercentage >= 70 ? 'var(--warning-glow)' : 'var(--success-glow)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block' }}>
                    {r.riskPercentage.toFixed(1)}% of limit
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payables (Money we owe suppliers) */}
      <div style={{ background: 'var(--bg-card)', padding: '20px', borderRadius: '16px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--warning)', padding: '8px', borderRadius: '10px' }}>
            <ArrowDownRight size={20} />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', letterSpacing: '-0.01em' }}>Payables (Outstanding to Suppliers)</h3>
        </div>
        
        {data.payables.length === 0 ? (
           <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500, background: 'var(--bg-main)', borderRadius: '12px', border: '1px dashed var(--border)' }}>
             No outstanding supplier dues. Great!
           </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {data.payables.map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', background: 'var(--bg-main)', borderRadius: '12px', borderLeft: '4px solid var(--border)', transition: 'transform 0.2s ease' }}
                   onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
                   onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}>
                <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-main)' }}>
                  {p.name}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--warning)', fontSize: '14px' }}>
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
