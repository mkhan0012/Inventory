import React from 'react';
import { Calendar, TrendingUp, TrendingDown, IndianRupee } from 'lucide-react';
import '../inventory/page.css';
import prisma from '@/lib/prisma';
import { getMonthlyComparisonData } from '@/actions/reports';
import MonthlyComparisonChart from '@/components/MonthlyComparisonChart';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Get current month sales
  const sales = await prisma.invoice.findMany({
    where: { date: { gte: startOfMonth } }
  });
  const totalSales = sales.reduce((acc, inv) => acc + inv.total, 0);

  // Get current month purchases
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte: startOfMonth } }
  });
  const totalPurchases = purchases.reduce((acc, pur) => acc + pur.total, 0);

  // Get current month expenses
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth } }
  });
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const netProfit = totalSales - totalPurchases - totalExpenses;

  const chartData = await getMonthlyComparisonData();

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

      <div className="stats-grid">
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingUp size={24} color="#10b981" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Total Sales (Income)</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>₹{totalSales.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingDown size={24} color="#ef4444" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Total Purchases</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>₹{totalPurchases.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <TrendingDown size={24} color="#f59e0b" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Total Expenses</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-main)' }}>₹{totalExpenses.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: '24px', border: netProfit >= 0 ? '2px solid rgba(16,185,129,0.3)' : '2px solid rgba(239,68,68,0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(41,98,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <IndianRupee size={24} color="#2962ff" />
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>Net Profit / Loss</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: netProfit >= 0 ? '#10b981' : '#ef4444' }}>
                ₹{Math.abs(netProfit).toFixed(2)} {netProfit < 0 ? '(Loss)' : ''}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
         <h2 style={{ fontSize: '16px', marginBottom: '16px', color: 'var(--text-main)' }}>Monthly Profit & Loss Comparison (Last 6 Months)</h2>
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
