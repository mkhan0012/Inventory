"use client";
import React, { useState } from 'react';
import { InventoryHealthItem } from '@/actions/inventory-analytics';
import { Search, PackageX, TrendingDown, DollarSign, Activity, AlertCircle } from 'lucide-react';
import StatCard from './StatCard';
import ExportTableButton from './ExportTableButton';
import '../app/(dashboard)/inventory/page.css';

interface Props {
  initialData: InventoryHealthItem[];
}

export default function InventoryHealthClient({ initialData }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const filteredData = initialData.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter 
      ? (statusFilter === 'DEAD_SLOW' ? (p.status === 'DEAD_STOCK' || p.status === 'SLOW_MOVING') : p.status === statusFilter) 
      : true;

    return matchesSearch && matchesStatus;
  });

  const totalCapitalTiedUp = initialData.reduce((acc, p) => acc + p.stockValue, 0);
  
  const deadStockItems = initialData.filter(p => p.status === 'DEAD_STOCK');
  const slowMovingItems = initialData.filter(p => p.status === 'SLOW_MOVING');
  const deadAndSlowItems = [...deadStockItems, ...slowMovingItems];
  const deadStockCapital = deadAndSlowItems.reduce((acc, p) => acc + p.stockValue, 0);
  
  const fastMovingItemsCount = initialData.filter(p => p.status === 'FAST_MOVING').length;

  const exportData = filteredData.map(p => ({
    "Product Code": p.code,
    "Product Name": p.name,
    "Category": p.category,
    "Current Stock": p.currentStock,
    "Stock Value (COGS)": p.stockValue,
    "Total Units Sold": p.totalUnitsSold,
    "Last Sale Date": p.lastSaleDate ? new Date(p.lastSaleDate).toLocaleDateString() : 'Never',
    "Days Since Sale": p.daysSinceLastSale ?? 'N/A',
    "Health Status": p.status
  }));

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'FAST_MOVING': return <span style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Fast Moving</span>;
      case 'HEALTHY': return <span style={{ background: 'rgba(59,130,246,0.1)', color: '#3b82f6', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Healthy</span>;
      case 'SLOW_MOVING': return <span style={{ background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Slow Moving</span>;
      case 'DEAD_STOCK': return <span style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', padding: '4px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 600 }}>Dead Stock</span>;
      default: return null;
    }
  };

  return (
    <>
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <StatCard 
          title="Total Capital in Stock" 
          numericValue={totalCapitalTiedUp} 
          prefix="₹"
          decimals={0}
          trend="Stock Value" 
          trendUp={true} 
          icon={<DollarSign size={24} color="#2962ff" />} 
          iconBg="rgba(41,98,255,0.1)"
          onClick={() => setStatusFilter(null)}
          isActive={statusFilter === null}
        />
        <StatCard 
          title="Capital in Dead/Slow Stock" 
          numericValue={deadStockCapital} 
          prefix="₹"
          decimals={0}
          trend="At Risk" 
          trendUp={deadStockCapital === 0} 
          icon={<AlertCircle size={24} color={deadStockCapital > 0 ? "#ef4444" : "#10b981"} />} 
          iconBg={deadStockCapital > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"}
          onClick={() => setStatusFilter('DEAD_SLOW')}
          isActive={statusFilter === 'DEAD_SLOW'}
        />
        <StatCard 
          title="Fast Moving Items" 
          numericValue={fastMovingItemsCount} 
          prefix=""
          decimals={0}
          trend="High Velocity" 
          trendUp={true} 
          icon={<Activity size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)"
          onClick={() => setStatusFilter('FAST_MOVING')}
          isActive={statusFilter === 'FAST_MOVING'}
        />
        <StatCard 
          title="Dead / Slow Items" 
          numericValue={deadAndSlowItems.length} 
          prefix=""
          decimals={0}
          trend="Requires Liquidation" 
          trendUp={deadAndSlowItems.length === 0} 
          icon={<TrendingDown size={24} color={deadAndSlowItems.length > 0 ? "#ef4444" : "#10b981"} />} 
          iconBg={deadAndSlowItems.length > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"}
          onClick={() => setStatusFilter('DEAD_SLOW')}
          isActive={statusFilter === 'DEAD_SLOW'}
        />
      </div>

      <div className="card table-container">
        <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
           <div className="search-wrapper" style={{ minWidth: '300px' }}>
             <Search size={18} className="search-icon" />
             <input 
               type="text" 
               placeholder="Search inventory..." 
               className="search-input"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           <ExportTableButton data={exportData} filename="Inventory_Health_Report" />
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Current Stock</th>
                <th style={{ textAlign: 'right' }}>Stock Value (Capital)</th>
                <th style={{ textAlign: 'right' }}>Lifetime Sold</th>
                <th style={{ textAlign: 'right' }}>Last Sale</th>
                <th style={{ textAlign: 'right' }}>Days Stagnant</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.code} • {p.category}</div>
                  </td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 500 }}>{p.currentStock.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontWeight: 600, color: p.status === 'DEAD_STOCK' ? 'var(--danger)' : 'inherit' }}>
                    ₹{p.stockValue.toLocaleString('en-IN', {maximumFractionDigits:0})}
                  </td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>{p.totalUnitsSold.toFixed(2)}</td>
                  <td style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>
                    {p.lastSaleDate ? new Date(p.lastSaleDate).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: p.daysSinceLastSale && p.daysSinceLastSale > 60 ? 600 : 400, color: p.daysSinceLastSale && p.daysSinceLastSale > 60 ? 'var(--danger)' : 'inherit' }}>
                    {p.daysSinceLastSale ?? 'N/A'}
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                    No inventory data found.
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
