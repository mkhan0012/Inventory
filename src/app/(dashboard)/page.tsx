import React from 'react';
import { Calendar, Package, ShoppingCart, BarChart3, IndianRupee, PackageCheck, ReceiptText } from 'lucide-react';
import StatCard from '@/components/StatCard';
import DashboardSalesChart from '@/components/DashboardSalesChart';
import AiInsightBanner from '@/components/AiInsightBanner';

import CustomerHoverCard from '@/components/CustomerHoverCard';
import './page.css';
import { getDashboardStats } from '@/actions/dashboard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const stats = await getDashboardStats();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="page-title">Dashboard</h1>
        <div className="date-picker">
          <span>{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          <Calendar size={18} color="var(--text-muted)" />
        </div>
      </div>

      <AiInsightBanner />

      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>Quick Snapshots</h2>
      </div>
      
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', marginBottom: '32px' }}>
        <StatCard 
          title="Today's Sales" 
          numericValue={stats.todaysSales}
          prefix="₹"
          decimals={2}
          trend="Today" 
          trendUp={true} 
          icon={<ShoppingCart size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
        />
        <StatCard 
          title="Monthly Sales" 
          numericValue={stats.monthlySales}
          prefix="₹"
          decimals={2}
          trend={`${stats.trends.salesVsLastMonth.pct}% vs Last Month`} 
          trendUp={stats.trends.salesVsLastMonth.isUp} 
          trendLabel={`(${stats.trends.salesVs6MonthAvg.isUp ? '+' : '-'}${stats.trends.salesVs6MonthAvg.pct}% vs 6M Avg)`}
          icon={<BarChart3 size={24} color="#8b5cf6" />} 
          iconBg="rgba(139,92,246,0.1)" 
          sparklineData={stats.chartData.month.map(d => ({ value: d.sales }))}
        />
        <StatCard 
          title="Monthly Profit" 
          numericValue={stats.monthlyProfit}
          prefix="₹"
          decimals={2}
          trend={`${stats.trends.profitVsLastMonth.pct}% vs Last Month`} 
          trendUp={stats.trends.profitVsLastMonth.isUp} 
          trendLabel={`(${stats.trends.profitVs6MonthAvg.isUp ? '+' : '-'}${stats.trends.profitVs6MonthAvg.pct}% vs 6M Avg)`}
          icon={<IndianRupee size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
          sparklineData={stats.chartData.month.map(d => ({ value: d.profit }))}
        />
      </div>

      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 600 }}>All-Time Performance</h2>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <StatCard 
          title="All-Time Sales" 
          numericValue={stats.allTimeSales}
          prefix="₹"
          decimals={2}
          trend="Total" 
          trendUp={true} 
          icon={<BarChart3 size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
          trendLabel="All-Time"
          sparklineData={stats.chartData.year.map(d => ({ value: d.sales }))}
        />
        <StatCard 
          title="All-Time Profit" 
          numericValue={stats.allTimeProfit}
          prefix="₹"
          decimals={2}
          trend="Total" 
          trendUp={true} 
          icon={<IndianRupee size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
          trendLabel="All-Time"
          sparklineData={stats.chartData.year.map(d => ({ value: d.profit }))}
        />
        <StatCard 
          title="All-Time Purchases" 
          numericValue={stats.allTimePurchases}
          prefix="₹"
          decimals={2}
          trend="Total" 
          trendUp={true} 
          icon={<ShoppingCart size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
          trendLabel="All-Time"
        />
        <StatCard 
          title="Total Stock Value" 
          numericValue={stats.stockValue}
          prefix="₹"
          decimals={2}
          trend="" 
          trendUp={true} 
          icon={<Package size={24} color="#2962ff" />} 
          iconBg="rgba(41,98,255,0.1)" 
        />
      </div>

      <div className="middle-grid">
        <DashboardSalesChart data={stats.chartData} />

        <div className="side-column">
          <div className="card" style={{ flex: 1 }}>
            <div className="card-header">
              <h3 className="card-title">Stock Alerts</h3>
              <Link href="/inventory" className="card-link">View All</Link>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.outOfStockProducts.length === 0 && stats.lowStockProducts.length === 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)', textAlign: 'center' }}>
                  <PackageCheck size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>Inventory Healthy</span>
                  <span style={{ fontSize: '12px', marginTop: '4px' }}>All items are sufficiently stocked.</span>
                </div>
              )}
              {stats.outOfStockProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '8px', borderLeft: '3px solid var(--danger)' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.code}</div>
                  </div>
                  <div style={{ color: 'var(--danger)', fontSize: '12px', fontWeight: 600 }}>Out of Stock</div>
                </div>
              ))}
              {stats.lowStockProducts.map(p => (
                <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'rgba(245, 158, 11, 0.05)', borderRadius: '8px', borderLeft: '3px solid #f59e0b' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: '13px', color: 'var(--text-main)' }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{p.code}</div>
                  </div>
                  <div style={{ color: '#f59e0b', fontSize: '12px', fontWeight: 600 }}>{p.stock} left</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-grid">
          <div className="card" style={{ gridColumn: '1 / -1' }}>
            <div className="card-header">
               <h3 className="card-title">Recent Sales</h3>
               <Link href="/sales" className="card-link">View All</Link>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'left' }}>
                    <th style={{ padding: '12px 8px' }}>Invoice No</th>
                    <th style={{ padding: '12px 8px' }}>Date</th>
                    <th style={{ padding: '12px 8px' }}>Customer</th>
                    <th style={{ padding: '12px 8px' }}>Amount</th>
                    <th style={{ padding: '12px 8px' }}>Status</th>
                    <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                      <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 500 }}>
                        {sale.invoiceNo}
                        {sale.type === 'DIRECT' && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '10px' }}>QUICK</span>}
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-main)' }}>{new Date(sale.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-main)' }}>
                        <CustomerHoverCard customerName={sale.customerName} amount={sale.total} />
                      </td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-main)', fontWeight: 500 }}>₹{sale.total.toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`status-badge ${sale.status.toLowerCase()}`}>{sale.status}</span>
                      </td>
                      <td style={{ padding: '12px 8px', display: 'flex', justifyContent: 'flex-end' }}>
                        <Link 
                          href={`/sales/${sale.id}/print`}
                          target="_blank"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '6px 12px',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            transition: 'opacity 0.2s'
                          }}
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {stats.recentSales.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                          <ReceiptText size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Sales Yet</span>
                          <span style={{ fontSize: '12px', marginTop: '4px', marginBottom: '16px' }}>Your recent invoices and direct sales will appear here.</span>
                          <Link href="/sales/new" style={{ background: 'var(--primary)', color: 'white', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>Create Sale</Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}
