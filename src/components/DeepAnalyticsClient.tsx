"use client";
import React, { useState, useMemo } from 'react';
import { DeepAnalyticsItem } from '@/actions/deep-analytics';
import { Search, AlertTriangle, TrendingUp, TrendingDown, Filter, ChevronDown, ChevronUp, PackageX } from 'lucide-react';
import StatCard from './StatCard';
import ExportTableButton from './ExportTableButton';
import '../app/(dashboard)/inventory/page.css'; // Reuse existing table styles

interface Props {
  initialData: DeepAnalyticsItem[];
}

type SortField = 'date' | 'productName' | 'customerName' | 'quantity' | 'grossRevenue' | 'netProfit' | 'marginPercent';
type SortOrder = 'asc' | 'desc';

export default function DeepAnalyticsClient({ initialData }: Props) {
  const [activeTab, setActiveTab] = useState<'TRANSACTIONS' | 'STOCK_SUMMARY'>('TRANSACTIONS');
  const [data, setData] = useState<DeepAnalyticsItem[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [filterType, setFilterType] = useState<'ALL' | 'LOSS' | 'NO_COST' | 'HIGH_MARGIN'>('ALL');

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Filter by Search Term
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(item => 
        item.productName.toLowerCase().includes(lower) || 
        item.saleNo.toLowerCase().includes(lower) ||
        item.customerName.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
      );
    }

    // Filter by Type
    if (filterType === 'LOSS') {
      result = result.filter(item => item.netProfit < 0);
    } else if (filterType === 'NO_COST') {
      result = result.filter(item => item.purchaseRate === 0);
    } else if (filterType === 'HIGH_MARGIN') {
      result = result.filter(item => item.marginPercent > 50);
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      if (sortField === 'date') {
        aValue = new Date(a.date).getTime();
        bValue = new Date(b.date).getTime();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [data, searchTerm, sortField, sortOrder, filterType]);

  const productStats = useMemo(() => {
    const map = new Map<string, { id: string, name: string, code: string, currentStock: number, sold: number, profit: number }>();
    data.forEach(item => {
      if (!map.has(item.productId)) {
        map.set(item.productId, {
          id: item.productId,
          name: item.productName,
          code: item.productCode,
          currentStock: item.currentStock,
          sold: 0,
          profit: 0
        });
      }
      const stat = map.get(item.productId)!;
      stat.sold += item.quantity;
      stat.profit += item.netProfit;
    });
    return Array.from(map.values()).sort((a, b) => b.sold - a.sold);
  }, [data]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc'); // Default to desc for new sort field
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />;
  };

  // Summary Metrics
  const totalRevenue = filteredAndSortedData.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const totalProfit = filteredAndSortedData.reduce((acc, curr) => acc + curr.netProfit, 0);
  const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  const itemsSoldAtLoss = filteredAndSortedData.filter(i => i.netProfit < 0).length;

  const topPerformerId = productStats.length > 0 ? productStats[0].id : null;
  const worstPerformerId = [...productStats].sort((a, b) => a.profit - b.profit)[0]?.profit < 0 
    ? [...productStats].sort((a, b) => a.profit - b.profit)[0]?.id 
    : null;

  // Export Data Prep
  const exportData = filteredAndSortedData.map(item => ({
    "Date": new Date(item.date).toLocaleDateString(),
    "Sale No": item.saleNo,
    "Type": item.type,
    "Customer": item.customerName,
    "Product": item.productName,
    "Category": item.category,
    "Qty": item.quantity,
    "Sale Price": item.rate,
    "Cost Price": item.purchaseRate,
    "Revenue": item.grossRevenue,
    "COGS": item.cogs,
    "Profit": item.netProfit,
    "Margin %": item.marginPercent.toFixed(2) + '%'
  }));

  const stockExcelData = productStats.map(p => ({
    "Item Code": p.code,
    "Product Name": p.name,
    "Stock Left": p.currentStock,
    "Units Sold": p.sold,
    "Profit Generated": p.profit
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Deep Analytics & Audit</h1>
        <div className="header-actions">
          {activeTab === 'TRANSACTIONS' ? (
            <ExportTableButton data={exportData} filename="Deep_Profit_Analytics" />
          ) : (
            <ExportTableButton data={stockExcelData} filename="Stock_Summary_Analytics" />
          )}
        </div>
      </div>
      
      <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '14px' }}>
        A granular breakdown of every product sold, exact margins, and aggregate stock movement.
      </p>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('TRANSACTIONS')}
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'TRANSACTIONS' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'TRANSACTIONS' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Transaction View
        </button>
        <button 
          onClick={() => setActiveTab('STOCK_SUMMARY')}
          style={{ 
            padding: '12px 0', 
            background: 'none', 
            border: 'none', 
            borderBottom: activeTab === 'STOCK_SUMMARY' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'STOCK_SUMMARY' ? 'var(--primary)' : 'var(--text-muted)',
            fontWeight: 600,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Product Stock Summary
        </button>
      </div>

      {activeTab === 'TRANSACTIONS' && (
        <>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <StatCard 
              title="Filtered Revenue" 
              numericValue={totalRevenue} 
              prefix="₹"
              decimals={2}
              trend="" 
              trendUp={true} 
              icon={<TrendingUp size={24} color="#2962ff" />} 
              iconBg="rgba(41,98,255,0.1)" 
            />
            <StatCard 
              title="Filtered Profit" 
              numericValue={totalProfit} 
              prefix="₹"
              decimals={2}
              trend="" 
              trendUp={totalProfit >= 0} 
              icon={<TrendingUp size={24} color={totalProfit >= 0 ? "#10b981" : "#ef4444"} />} 
              iconBg={totalProfit >= 0 ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)"} 
            />
            <StatCard 
              title="Avg. Margin (Filtered)" 
              value={`${avgMargin.toFixed(1)}%`}
              trend="" 
              trendUp={avgMargin > 0} 
              icon={<Filter size={24} color="#8b5cf6" />} 
              iconBg="rgba(139,92,246,0.1)" 
            />
            <StatCard 
              title="Items Sold at Loss" 
              numericValue={itemsSoldAtLoss} 
              prefix=""
              decimals={0}
              trend={itemsSoldAtLoss > 0 ? "Requires Review" : "All Good"} 
              trendUp={itemsSoldAtLoss === 0} 
              icon={<AlertTriangle size={24} color={itemsSoldAtLoss > 0 ? "#ef4444" : "#10b981"} />} 
              iconBg={itemsSoldAtLoss > 0 ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.1)"} 
            />
          </div>

          <div className="card table-container">
            <div style={{ padding: '20px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
              <div className="search-wrapper" style={{ flex: 1, minWidth: '300px' }}>
                <Search size={18} className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search by product, customer, invoice..." 
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select className="input-field" value={filterType} onChange={(e) => setFilterType(e.target.value as any)} style={{ width: 'auto', padding: '8px 12px' }}>
                  <option value="ALL">All Items</option>
                  <option value="LOSS">Sold at Loss (Profit &lt; 0)</option>
                  <option value="NO_COST">Missing Cost (Purchase Rate = 0)</option>
                  <option value="HIGH_MARGIN">High Margin (&gt; 50%)</option>
                </select>
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('date')} style={{ cursor: 'pointer' }}>Date <SortIcon field="date" /></th>
                    <th>Invoice/Sale</th>
                    <th onClick={() => handleSort('customerName')} style={{ cursor: 'pointer' }}>Customer <SortIcon field="customerName" /></th>
                    <th onClick={() => handleSort('productName')} style={{ cursor: 'pointer' }}>Item <SortIcon field="productName" /></th>
                    <th onClick={() => handleSort('quantity')} style={{ cursor: 'pointer', textAlign: 'right' }}>Qty <SortIcon field="quantity" /></th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right' }}>Sell Price</th>
                    <th onClick={() => handleSort('grossRevenue')} style={{ cursor: 'pointer', textAlign: 'right' }}>Revenue <SortIcon field="grossRevenue" /></th>
                    <th onClick={() => handleSort('netProfit')} style={{ cursor: 'pointer', textAlign: 'right' }}>Profit <SortIcon field="netProfit" /></th>
                    <th onClick={() => handleSort('marginPercent')} style={{ cursor: 'pointer', textAlign: 'right' }}>Margin % <SortIcon field="marginPercent" /></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedData.map(item => (
                    <tr key={item.id} style={{ background: item.netProfit < 0 ? 'rgba(239,68,68,0.05)' : item.purchaseRate === 0 ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                      <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{new Date(item.date).toLocaleDateString()}</td>
                      <td style={{ fontSize: '13px', fontWeight: 500 }}>
                        {item.saleNo}
                        {item.type === 'DIRECT_SALE' && <span style={{ marginLeft: '6px', fontSize: '10px', background: 'rgba(245,158,11,0.1)', color: '#d97706', padding: '2px 6px', borderRadius: '10px' }}>QUICK</span>}
                      </td>
                      <td style={{ fontSize: '13px', color: 'var(--text-main)' }}>{item.customerName}</td>
                      <td>
                        <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.productName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.category}</div>
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px' }}>{item.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>₹{item.purchaseRate.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', color: 'var(--text-muted)' }}>₹{item.rate.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 500 }}>₹{item.grossRevenue.toFixed(2)}</td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: item.netProfit > 0 ? 'var(--success)' : item.netProfit < 0 ? 'var(--danger)' : 'inherit' }}>
                        ₹{item.netProfit.toFixed(2)}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: '13px', fontWeight: 600, color: item.marginPercent > 0 ? 'var(--success)' : item.marginPercent < 0 ? 'var(--danger)' : 'inherit' }}>
                        {item.marginPercent.toFixed(1)}%
                        {item.purchaseRate === 0 && <span title="Missing purchase cost"><AlertTriangle size={12} color="#f59e0b" style={{ display: 'inline', marginLeft: '4px' }} /></span>}
                      </td>
                    </tr>
                  ))}
                  {filteredAndSortedData.length === 0 && (
                    <tr>
                      <td colSpan={10} style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                        No matching sales data found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'STOCK_SUMMARY' && (
        <div className="card table-container" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Stock & Product Movement Summary</h2>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Current stock levels, units sold, and total profit generated by item.</p>
            </div>
          </div>
          {productStats.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <PackageX size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Stock Movement</span>
              <span style={{ fontSize: '12px', marginTop: '4px' }}>No items were sold during this period.</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '12px 8px' }}>Product</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Stock Left</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Sold Total</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Total Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {productStats.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 8px' }}>
                        <div style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                          {p.name}
                          {p.id === topPerformerId && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(245, 158, 11, 0.1)', color: '#d97706', padding: '2px 6px', borderRadius: '10px' }}>🏆 Top Seller</span>}
                          {p.id === worstPerformerId && <span style={{ marginLeft: '8px', fontSize: '10px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '2px 6px', borderRadius: '10px' }}>⚠️ Loss</span>}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.code}</div>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 'bold' }}>{p.currentStock.toFixed(2)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', color: p.sold > 0 ? 'var(--success)' : 'inherit', fontWeight: 500 }}>{p.sold.toFixed(2)}</td>
                      <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500, color: p.profit > 0 ? 'var(--success)' : p.profit < 0 ? 'var(--danger)' : 'inherit' }}>
                        ₹{p.profit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
