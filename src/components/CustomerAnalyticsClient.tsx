"use client";
import React, { useState } from 'react';
import { CustomerAnalyticsItem } from '@/actions/customer-analytics';
import { Search, Trophy, AlertTriangle, TrendingUp, DollarSign, Clock } from 'lucide-react';
import StatCard from './StatCard';
import ExportTableButton from './ExportTableButton';
import '../app/(dashboard)/inventory/page.css';

interface Props {
  initialData: CustomerAnalyticsItem[];
}

export default function CustomerAnalyticsClient({ initialData }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = initialData.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const totalCLV = initialData.reduce((acc, c) => acc + c.totalRevenue, 0);
  const totalProfit = initialData.reduce((acc, c) => acc + c.totalProfit, 0);
  const avgMargin = totalCLV > 0 ? (totalProfit / totalCLV) * 100 : 0;
  
  const vipCount = initialData.filter(c => c.segment === 'VIP').length;
  const atRiskCount = initialData.filter(c => c.segment === 'AT_RISK' || c.segment === 'DORMANT').length;

  const exportData = filteredData.map(c => ({
    "Customer Name": c.name,
    "Phone": c.phone || 'N/A',
    "Total Purchases": c.purchaseCount,
    "Lifetime Revenue": c.totalRevenue,
    "Lifetime Profit": c.totalProfit,
    "Margin %": c.marginPercent.toFixed(2) + '%',
    "Outstanding Due": c.dueAmount,
    "Last Purchase": c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString() : 'Never',
    "Segment": c.segment
  }));

  const getSegmentBadge = (segment: string) => {
    switch(segment) {
      case 'VIP': return <span style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>VIP Customer</span>;
      case 'ACTIVE': return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Active</span>;
      case 'AT_RISK': return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>At Risk</span>;
      case 'DORMANT': return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Dormant</span>;
      default: return <span style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>New / Unknown</span>;
    }
  };

  return (
    <>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard 
          title="Total CLV (Revenue)" 
          numericValue={totalCLV} 
          prefix="₹"
          decimals={0}
          trend="Lifetime" 
          trendUp={true} 
          icon={<DollarSign size={24} color="#2962ff" />} 
          iconBg="rgba(41,98,255,0.1)" 
        />
        <StatCard 
          title="Total Lifetime Profit" 
          numericValue={totalProfit} 
          prefix="₹"
          decimals={0}
          trend="Lifetime" 
          trendUp={totalProfit >= 0} 
          icon={<TrendingUp size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
        />
        <StatCard 
          title="VIP Customers" 
          numericValue={vipCount} 
          prefix=""
          decimals={0}
          trend="Highest Value" 
          trendUp={true} 
          icon={<Trophy size={24} color="#8b5cf6" />} 
          iconBg="rgba(139,92,246,0.1)" 
        />
        <StatCard 
          title="At Risk / Dormant" 
          numericValue={atRiskCount} 
          prefix=""
          decimals={0}
          trend="Needs attention" 
          trendUp={atRiskCount === 0} 
          icon={<AlertTriangle size={24} color={atRiskCount > 0 ? "#ef4444" : "#10b981"} />} 
          iconBg={atRiskCount > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"} 
        />
      </div>

      <div className="card table-container">
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
           <div className="search-wrapper" style={{ minWidth: '300px' }}>
             <Search size={18} className="search-icon" />
             <input 
               type="text" 
               placeholder="Search customers..." 
               className="search-input"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <ExportTableButton data={exportData} filename="Customer_Intelligence_Report" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Segment</th>
                <th style={{ textAlign: 'right' }}>Total Orders</th>
                <th style={{ textAlign: 'right' }}>Lifetime Revenue</th>
                <th style={{ textAlign: 'right' }}>Lifetime Profit</th>
                <th style={{ textAlign: 'right' }}>Avg. Margin</th>
                <th style={{ textAlign: 'right' }}>Outstanding</th>
                <th style={{ textAlign: 'right' }}>Last Purchase</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{c.name}</div>
                    {c.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{c.phone}</div>}
                  </td>
                  <td>{getSegmentBadge(c.segment)}</td>
                  <td style={{ textAlign: 'right' }}>{c.purchaseCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{c.totalRevenue.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: c.totalProfit > 0 ? 'var(--success)' : 'inherit' }}>
                    ₹{c.totalProfit.toLocaleString('en-IN', {maximumFractionDigits:0})}
                  </td>
                  <td style={{ textAlign: 'right' }}>{c.marginPercent.toFixed(1)}%</td>
                  <td style={{ textAlign: 'right', color: c.dueAmount > 0 ? 'var(--danger)' : 'inherit', fontWeight: c.dueAmount > 0 ? 600 : 400 }}>
                    ₹{c.dueAmount.toLocaleString('en-IN', {maximumFractionDigits:0})}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {c.lastPurchaseDate ? new Date(c.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No customer data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
