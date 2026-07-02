import React from 'react';
import { Calendar, Package, ShoppingCart, BarChart3, IndianRupee } from 'lucide-react';
import StatCard from '@/components/StatCard';
import DashboardSalesChart from '@/components/DashboardSalesChart';
import TopSelling from '@/components/TopSelling';
import AiChatWidget from '@/components/AiChatWidget';
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

      {/* AI Assistant Row */}
      <div style={{ marginBottom: '24px' }}>
        <AiChatWidget />
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <StatCard 
          title="All-Time Sales" 
          value={`₹${stats.allTimeSales.toLocaleString('en-IN')}`} 
          trend="Total" 
          trendUp={true} 
          icon={<BarChart3 size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
        />
        <StatCard 
          title="All-Time Profit" 
          value={`₹${stats.allTimeProfit.toLocaleString('en-IN')}`} 
          trend="Total" 
          trendUp={true} 
          icon={<IndianRupee size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
        />
        <StatCard 
          title="All-Time Purchases" 
          value={`₹${stats.allTimePurchases.toLocaleString('en-IN')}`} 
          trend="Total" 
          trendUp={true} 
          icon={<ShoppingCart size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
        />
        <StatCard 
          title="Total Stock Value" 
          value={`₹${stats.stockValue.toLocaleString('en-IN')}`} 
          trend="" 
          trendUp={true} 
          icon={<Package size={24} color="#2962ff" />} 
          iconBg="rgba(41,98,255,0.1)" 
        />
        <StatCard 
          title="Today's Sales" 
          value={`₹${stats.todaysSales.toLocaleString('en-IN')}`} 
          trend="" 
          trendUp={true} 
          icon={<ShoppingCart size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
        />
        <StatCard 
          title="Monthly Sales" 
          value={`₹${stats.monthlySales.toLocaleString('en-IN')}`} 
          trend="" 
          trendUp={true} 
          icon={<BarChart3 size={24} color="#8b5cf6" />} 
          iconBg="rgba(139,92,246,0.1)" 
        />
        <StatCard 
          title="Monthly Profit" 
          value={`₹${stats.monthlyProfit.toLocaleString('en-IN')}`} 
          trend="" 
          trendUp={true} 
          icon={<IndianRupee size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
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
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All items are sufficiently stocked.</div>
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
                  </tr>
                </thead>
                <tbody>
                  {stats.recentSales.map(sale => (
                    <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px' }}>
                      <td style={{ padding: '12px 8px', color: 'var(--primary)', fontWeight: 500 }}>{sale.invoiceNo}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-main)' }}>{new Date(sale.date).toLocaleDateString()}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-main)' }}>{sale.customer.name}</td>
                      <td style={{ padding: '12px 8px', color: 'var(--text-main)', fontWeight: 500 }}>₹{sale.total.toFixed(2)}</td>
                      <td style={{ padding: '12px 8px' }}>
                        <span className={`status-badge ${sale.status.toLowerCase()}`}>{sale.status}</span>
                      </td>
                    </tr>
                  ))}
                  {stats.recentSales.length === 0 && (
                    <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>No recent sales</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </div>
  );
}
