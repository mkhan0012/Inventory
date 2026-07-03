import React from 'react';
import { Calendar, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import '../inventory/page.css';
import prisma from '@/lib/prisma';
import { getMonthlyComparisonData } from '@/actions/reports';
import MonthlyComparisonChart from '@/components/MonthlyComparisonChart';
import StatCard from '@/components/StatCard';
import { BarChart3, Package, ShoppingCart } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get current month sales
  const sales = await prisma.invoice.findMany({
    where: { date: { gte: startOfMonth } }
  });
  
  // Get current month purchases
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte: startOfMonth } }
  });
  
  // Get current month expenses
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth } }
  });

  // Get current month historical records
  const historical = await prisma.historicalRecord.findMany({
    where: { date: { gte: startOfMonth } }
  });

  const totalSales = sales.reduce((acc, inv) => acc + inv.total, 0) + historical.reduce((acc, h) => acc + h.sales, 0);
  const totalPurchases = purchases.reduce((acc, pur) => acc + pur.total, 0) + historical.reduce((acc, h) => acc + h.purchases, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const netProfit = totalSales - totalPurchases - totalExpenses;

  const { chartData, averages } = await getMonthlyComparisonData();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Financial Reports</h1>
        <div className="header-actions">
          <a href="/api/export-gst" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '13px' }}>
            Export GST Excel
          </a>
          <div className="date-picker">
            <span>This Month ({startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</span>
            <Calendar size={18} color="var(--text-muted)" />
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Total Sales (This Month)" 
          value={`₹${totalSales.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          trend="" 
          trendUp={true} 
          icon={<TrendingUp size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
        />
        <StatCard 
          title="Total Purchases (This Month)" 
          value={`₹${totalPurchases.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          trend="" 
          trendUp={false} 
          icon={<TrendingDown size={24} color="#ef4444" />} 
          iconBg="rgba(239,68,68,0.1)" 
        />
        <StatCard 
          title="Total Expenses (This Month)" 
          value={`₹${totalExpenses.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          trend="" 
          trendUp={false} 
          icon={<TrendingDown size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
        />
        <StatCard 
          title="Net Profit / Loss (This Month)" 
          value={`₹${Math.abs(netProfit).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
          trend={netProfit < 0 ? 'Loss' : 'Profit'} 
          trendUp={netProfit >= 0} 
          icon={<IndianRupee size={24} color={netProfit >= 0 ? "#2962ff" : "#ef4444"} />} 
          iconBg={netProfit >= 0 ? "rgba(41,98,255,0.1)" : "rgba(239,68,68,0.1)"} 
        />
      </div>
      
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>All-Time Monthly Averages</h2>
         </div>
         <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
           <StatCard 
             title="Avg. Monthly Sales" 
             value={`₹${averages.income.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
             trend="Average" 
             trendUp={true} 
             icon={<BarChart3 size={24} color="#10b981" />} 
             iconBg="rgba(16,185,129,0.1)" 
             trendLabel="All-Time"
           />
           <StatCard 
             title="Avg. Monthly Expenses" 
             value={`₹${averages.expenses.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
             trend="Average" 
             trendUp={false} 
             icon={<ShoppingCart size={24} color="#ef4444" />} 
             iconBg="rgba(239,68,68,0.1)" 
             trendLabel="All-Time"
           />
           <StatCard 
             title="Avg. Monthly Profit" 
             value={`₹${averages.profit.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`} 
             trend="Average" 
             trendUp={averages.profit >= 0} 
             icon={<IndianRupee size={24} color={averages.profit >= 0 ? "#2962ff" : "#ef4444"} />} 
             iconBg={averages.profit >= 0 ? "rgba(41,98,255,0.1)" : "rgba(239,68,68,0.1)"} 
             trendLabel="All-Time"
           />
         </div>
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
         <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-main)' }}>Monthly Profit & Loss Comparison (All-Time)</h2>
         <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>Use the slider below the chart to zoom into specific months.</p>
         <MonthlyComparisonChart data={chartData} />
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
         <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-main)' }}>Detailed Expenses Breakdown</h2>
         {expenses.length === 0 ? (
           <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No expenses for this month.</div>
         ) : (
           <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
             <thead>
               <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                 <th style={{ padding: '12px 8px' }}>Date</th>
                 <th style={{ padding: '12px 8px' }}>Category</th>
                 <th style={{ padding: '12px 8px' }}>Description</th>
                 <th style={{ padding: '12px 8px', textAlign: 'right' }}>Amount</th>
               </tr>
             </thead>
             <tbody>
               {expenses.map(e => (
                 <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                   <td style={{ padding: '12px 8px' }}>{new Date(e.date).toLocaleDateString()}</td>
                   <td style={{ padding: '12px 8px', fontWeight: 500 }}>{e.category}</td>
                   <td style={{ padding: '12px 8px' }}>{e.description}</td>
                   <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>₹{e.amount.toFixed(2)}</td>
                 </tr>
               ))}
             </tbody>
           </table>
         )}
      </div>
    </div>
  );
}
