"use client";
import React, { useState } from 'react';
import { SupplierAnalyticsItem } from '@/actions/supplier-analytics';
import { Search, TrendingUp, TrendingDown, Minus, ShoppingBag, PieChart } from 'lucide-react';
import StatCard from './StatCard';
import ExportTableButton from './ExportTableButton';
import '../app/(dashboard)/inventory/page.css';

interface Props {
  initialData: SupplierAnalyticsItem[];
}

export default function SupplierAnalyticsClient({ initialData }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredData = initialData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  const totalSupplied = initialData.reduce((acc, s) => acc + s.totalSuppliedValue, 0);
  const totalOutstanding = initialData.reduce((acc, s) => acc + s.dueAmount, 0);
  
  const increasingSuppliers = initialData.filter(s => s.priceTrend === 'INCREASING').length;

  const exportData = filteredData.map(s => ({
    "Supplier Name": s.name,
    "Phone": s.phone || 'N/A',
    "Total Purchases": s.purchaseCount,
    "Lifetime Supplied Value": s.totalSuppliedValue,
    "Outstanding Due": s.dueAmount,
    "Dependency %": s.dependencyPercentage.toFixed(1) + '%',
    "Price Trend": s.priceTrend,
    "Avg Price Change": s.avgPriceChangePercent.toFixed(1) + '%',
    "Last Purchase": s.lastPurchaseDate ? new Date(s.lastPurchaseDate).toLocaleDateString() : 'Never'
  }));

  const getTrendBadge = (trend: string, change: number) => {
    switch(trend) {
      case 'INCREASING': return <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}><TrendingUp size={14} /> +{change.toFixed(1)}%</span>;
      case 'DECREASING': return <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}><TrendingDown size={14} /> {change.toFixed(1)}%</span>;
      case 'STABLE': return <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 500 }}><Minus size={14} /> Stable</span>;
      default: return <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>N/A</span>;
    }
  };

  return (
    <>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard 
          title="Total Lifetime Supplied" 
          numericValue={totalSupplied} 
          prefix="₹"
          decimals={0}
          trend="Total Volume" 
          trendUp={true} 
          icon={<ShoppingBag size={24} color="#2962ff" />} 
          iconBg="rgba(41,98,255,0.1)" 
        />
        <StatCard 
          title="Total Outstanding Due" 
          numericValue={totalOutstanding} 
          prefix="₹"
          decimals={0}
          trend="Needs payment" 
          trendUp={totalOutstanding === 0} 
          icon={<PieChart size={24} color={totalOutstanding > 0 ? "#f59e0b" : "#10b981"} />} 
          iconBg={totalOutstanding > 0 ? "rgba(245,158,11,0.1)" : "rgba(16,185,129,0.1)"} 
        />
        <StatCard 
          title="Price Increasing Suppliers" 
          numericValue={increasingSuppliers} 
          prefix=""
          decimals={0}
          trend="Eroding margins" 
          trendUp={increasingSuppliers === 0} 
          icon={<TrendingUp size={24} color={increasingSuppliers > 0 ? "#ef4444" : "#10b981"} />} 
          iconBg={increasingSuppliers > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"} 
        />
      </div>

      <div className="card table-container">
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
           <div className="search-wrapper" style={{ minWidth: '300px' }}>
             <Search size={18} className="search-icon" />
             <input 
               type="text" 
               placeholder="Search suppliers..." 
               className="search-input"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <ExportTableButton data={exportData} filename="Supplier_Analytics_Report" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th style={{ textAlign: 'right' }}>Total Orders</th>
                <th style={{ textAlign: 'right' }}>Dependency %</th>
                <th style={{ textAlign: 'right' }}>Total Supplied</th>
                <th style={{ textAlign: 'right' }}>Outstanding</th>
                <th style={{ textAlign: 'right' }}>Price Trend</th>
                <th style={{ textAlign: 'right' }}>Last Purchase</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(s => (
                <tr key={s.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{s.name}</div>
                    {s.phone && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.phone}</div>}
                  </td>
                  <td style={{ textAlign: 'right' }}>{s.purchaseCount}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                      {s.dependencyPercentage.toFixed(1)}%
                      <div style={{ width: '40px', height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${s.dependencyPercentage}%`, height: '100%', background: s.dependencyPercentage > 50 ? '#ef4444' : s.dependencyPercentage > 25 ? '#f59e0b' : '#3b82f6' }} />
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>₹{s.totalSuppliedValue.toLocaleString('en-IN', {maximumFractionDigits:0})}</td>
                  <td style={{ textAlign: 'right', color: s.dueAmount > 0 ? 'var(--danger)' : 'inherit', fontWeight: s.dueAmount > 0 ? 600 : 400 }}>
                    ₹{s.dueAmount.toLocaleString('en-IN', {maximumFractionDigits:0})}
                  </td>
                  <td style={{ textAlign: 'right', display: 'flex', justifyContent: 'flex-end' }}>
                    {getTrendBadge(s.priceTrend, s.avgPriceChangePercent)}
                  </td>
                  <td style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {s.lastPurchaseDate ? new Date(s.lastPurchaseDate).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No supplier data found.
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
