import React from 'react';
import { Calendar, TrendingUp, TrendingDown, IndianRupee, BarChart3, Package, ShoppingCart, ReceiptText, PackageX } from 'lucide-react';
import '../inventory/page.css';
import prisma from '@/lib/prisma';
import { getMonthlyComparisonData } from '@/actions/reports';
import MonthlyComparisonChart from '@/components/MonthlyComparisonChart';
import StatCard from '@/components/StatCard';
import MonthPicker from '@/components/MonthPicker';
import ExpenseDonutChart from '@/components/ExpenseDonutChart';
import ExportTableButton from '@/components/ExportTableButton';

export const dynamic = 'force-dynamic';

export default async function ReportsPage({
  searchParams,
}: {
  searchParams?: { month?: string }
}) {
  const startOfMonth = new Date();
  if (searchParams?.month) {
    const [year, month] = searchParams.month.split('-');
    startOfMonth.setFullYear(parseInt(year), parseInt(month) - 1, 1);
  } else {
    startOfMonth.setDate(1);
  }
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setMilliseconds(-1);

  // Get current month sales
  const sales = await prisma.invoice.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } }
  });
  
  const directSales = await prisma.directSale.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } }
  });
  
  // Get current month purchases
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } }
  });
  
  // Get current month expenses
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } }
  });

  // Get current month historical records
  const historical = await prisma.historicalRecord.findMany({
    where: { date: { gte: startOfMonth, lte: endOfMonth } }
  });

  const totalSales = sales.reduce((acc, inv) => acc + inv.total, 0) + historical.reduce((acc, h) => acc + h.sales, 0) + directSales.reduce((acc, ds) => acc + ds.total, 0);
  const totalPurchases = purchases.reduce((acc, pur) => acc + pur.total, 0) + historical.reduce((acc, h) => acc + h.purchases, 0);
  const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);

  const netProfit = totalSales - totalPurchases - totalExpenses;

  // Get last month dates and calculate MoM
  const startOfLastMonth = new Date(startOfMonth);
  startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
  const endOfLastMonth = new Date(startOfMonth);
  endOfLastMonth.setMilliseconds(-1);

  const lastMonthSales = await prisma.invoice.findMany({ where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } } });
  const lastMonthDirectSales = await prisma.directSale.findMany({ where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } } });
  const lastMonthPurchases = await prisma.purchase.findMany({ where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } } });
  const lastMonthExpenses = await prisma.expense.findMany({ where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } } });
  const lastMonthHistorical = await prisma.historicalRecord.findMany({ where: { date: { gte: startOfLastMonth, lte: endOfLastMonth } } });

  const prevTotalSales = lastMonthSales.reduce((a, b) => a + b.total, 0) + lastMonthDirectSales.reduce((a, b) => a + b.total, 0) + lastMonthHistorical.reduce((a, b) => a + b.sales, 0);
  const prevTotalPurchases = lastMonthPurchases.reduce((a, b) => a + b.total, 0) + lastMonthHistorical.reduce((a, b) => a + b.purchases, 0);
  const prevTotalExpenses = lastMonthExpenses.reduce((a, b) => a + b.amount, 0);
  const prevNetProfit = prevTotalSales - prevTotalPurchases - prevTotalExpenses;

  const calcTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "↑ 100% vs last month" : "";
    const percent = ((current - previous) / Math.abs(previous)) * 100;
    const arrow = percent > 0 ? "↑" : percent < 0 ? "↓" : "";
    return `${arrow} ${Math.abs(percent).toFixed(1)}% vs last month`;
  };

  const { chartData, averages } = await getMonthlyComparisonData();

  // New Request: Monthly Stock Summary
  const products = await prisma.product.findMany();
  const invoiceItemsThisMonth = await prisma.invoiceItem.findMany({
    where: { invoice: { date: { gte: startOfMonth, lte: endOfMonth } } }
  });

  const directSaleItemsThisMonth = await prisma.directSaleItem.findMany({
    where: { directSale: { date: { gte: startOfMonth, lte: endOfMonth } } }
  });

  const productStats = products.map(p => {
    const invItems = invoiceItemsThisMonth.filter(i => i.productId === p.id);
    const dsItems = directSaleItemsThisMonth.filter(i => i.productId === p.id);

    const totalSold = invItems.reduce((acc, curr) => acc + curr.quantity, 0) + dsItems.reduce((acc, curr) => acc + curr.quantity, 0);
    const totalProfit = invItems.reduce((acc, curr) => acc + ((curr.rate - curr.purchaseRate) * curr.quantity), 0) + dsItems.reduce((acc, curr) => acc + ((curr.rate - curr.purchaseRate) * curr.quantity), 0);
    
    return {
      id: p.id,
      name: p.name,
      code: p.code,
      currentStock: p.stock,
      soldThisMonth: totalSold,
      profitThisMonth: totalProfit
    };
  }).filter(p => p.soldThisMonth > 0 || p.currentStock > 0);
  
  productStats.sort((a, b) => b.soldThisMonth - a.soldThisMonth);

  // Find worst performer
  let worstPerformerId: string | null = null;
  let topPerformerId: string | null = null;
  if (productStats.length > 0) {
    topPerformerId = productStats[0].id;
    const sortedByProfit = [...productStats].sort((a, b) => a.profitThisMonth - b.profitThisMonth);
    if (sortedByProfit[0].profitThisMonth < 0) {
      worstPerformerId = sortedByProfit[0].id;
    }
  }

  // Pre-process for Excel export
  const stockExcelData = productStats.map(p => ({
    "Item Code": p.code,
    "Product Name": p.name,
    "Stock Left": p.currentStock,
    "Units Sold": p.soldThisMonth,
    "Profit Generated": p.profitThisMonth
  }));

  const expensesExcelData = expenses.map(e => ({
    "Date": new Date(e.date).toLocaleDateString(),
    "Category": e.category,
    "Description": e.description,
    "Amount": e.amount
  }));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Financial Reports</h1>
        <div className="header-actions">
          <a href="/api/export-gst" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', fontSize: '13px' }}>
            Export GST Excel
          </a>
          <div className="date-picker">
            <span style={{ marginRight: '8px' }}>({startOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})</span>
            <MonthPicker />
          </div>
        </div>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <StatCard 
          title="Total Sales (This Month)" 
          numericValue={totalSales} 
          prefix="₹"
          decimals={2}
          trend={calcTrend(totalSales, prevTotalSales)} 
          trendUp={totalSales >= prevTotalSales} 
          icon={<TrendingUp size={24} color="#10b981" />} 
          iconBg="rgba(16,185,129,0.1)" 
        />
        <StatCard 
          title="Total Purchases (This Month)" 
          numericValue={totalPurchases} 
          prefix="₹"
          decimals={2}
          trend={calcTrend(totalPurchases, prevTotalPurchases)} 
          trendUp={totalPurchases < prevTotalPurchases} 
          icon={<TrendingDown size={24} color="#ef4444" />} 
          iconBg="rgba(239,68,68,0.1)" 
        />
        <StatCard 
          title="Total Expenses (This Month)" 
          numericValue={totalExpenses} 
          prefix="₹"
          decimals={2}
          trend={calcTrend(totalExpenses, prevTotalExpenses)} 
          trendUp={totalExpenses < prevTotalExpenses} 
          icon={<TrendingDown size={24} color="#f59e0b" />} 
          iconBg="rgba(245,158,11,0.1)" 
        />
        <StatCard 
          title="Net Profit (This Month)" 
          numericValue={Math.abs(netProfit)} 
          prefix="₹"
          decimals={2}
          trend={calcTrend(netProfit, prevNetProfit)} 
          trendUp={netProfit >= prevNetProfit} 
          icon={<IndianRupee size={24} color={netProfit >= 0 ? "#2962ff" : "#ef4444"} />} 
          iconBg={netProfit >= 0 ? "rgba(41,98,255,0.1)" : "rgba(239,68,68,0.1)"} 
        />
      </div>
      
      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-main)' }}>All-Time Monthly Averages</h2>
         </div>
         <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
           <StatCard 
             title="Avg. Monthly Sales" 
             numericValue={averages.income} 
             prefix="₹"
             decimals={2}
             trend="Average" 
             trendUp={true} 
             icon={<BarChart3 size={24} color="#10b981" />} 
             iconBg="rgba(16,185,129,0.1)" 
             trendLabel="All-Time"
           />
           <StatCard 
             title="Avg. Monthly Expenses" 
             numericValue={averages.expenses} 
             prefix="₹"
             decimals={2}
             trend="Average" 
             trendUp={false} 
             icon={<ShoppingCart size={24} color="#ef4444" />} 
             iconBg="rgba(239,68,68,0.1)" 
             trendLabel="All-Time"
           />
           <StatCard 
             title="Avg. Monthly Profit" 
             numericValue={Math.abs(averages.profit)} 
             prefix="₹"
             decimals={2}
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
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <h2 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Detailed Expenses Breakdown</h2>
           {expenses.length > 0 && <ExportTableButton data={expensesExcelData} filename={`Expenses_${startOfMonth.toLocaleString('en-US', {month:'short'})}_${startOfMonth.getFullYear()}`} />}
         </div>
         {expenses.length === 0 ? (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <ReceiptText size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Expenses</span>
              <span style={{ fontSize: '12px', marginTop: '4px' }}>No expenses have been recorded for this month.</span>
           </div>
         ) : (
           <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
             <ExpenseDonutChart expenses={expenses} />
             <div style={{ overflowY: 'auto', maxHeight: '300px' }}>
               <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                 <thead>
                   <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                     <th style={{ padding: '12px 8px' }}>Date</th>
                     <th style={{ padding: '12px 8px' }}>Category</th>
                     <th style={{ padding: '12px 8px', textAlign: 'right' }}>Amount</th>
                   </tr>
                 </thead>
                 <tbody>
                   {expenses.map(e => (
                     <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                       <td style={{ padding: '12px 8px' }}>{new Date(e.date).toLocaleDateString()}</td>
                       <td style={{ padding: '12px 8px', fontWeight: 500 }}>
                         {e.category}
                         <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{e.description}</div>
                       </td>
                       <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500 }}>₹{e.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
         )}
      </div>

      <div className="card" style={{ marginTop: '24px', padding: '24px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
           <div>
             <h2 style={{ fontSize: '16px', color: 'var(--text-main)' }}>Monthly Stock Summary</h2>
             <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>Current stock levels, units sold this month, and profit generated by item.</p>
           </div>
           {productStats.length > 0 && <ExportTableButton data={stockExcelData} filename={`StockSummary_${startOfMonth.toLocaleString('en-US', {month:'short'})}_${startOfMonth.getFullYear()}`} />}
         </div>
         {productStats.length === 0 ? (
           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <PackageX size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Stock Movement</span>
              <span style={{ fontSize: '12px', marginTop: '4px' }}>No items were sold or logged this month.</span>
           </div>
         ) : (
           <div style={{ overflowX: 'auto' }}>
             <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
               <thead>
                 <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left', color: 'var(--text-muted)' }}>
                   <th style={{ padding: '12px 8px' }}>Product</th>
                   <th style={{ padding: '12px 8px', textAlign: 'right' }}>Stock Left</th>
                   <th style={{ padding: '12px 8px', textAlign: 'right' }}>Sold (Month)</th>
                   <th style={{ padding: '12px 8px', textAlign: 'right' }}>Profit (Month)</th>
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
                     <td style={{ padding: '12px 8px', textAlign: 'right', color: p.soldThisMonth > 0 ? 'var(--success)' : 'inherit', fontWeight: 500 }}>{p.soldThisMonth.toFixed(2)}</td>
                     <td style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 500, color: p.profitThisMonth > 0 ? 'var(--success)' : p.profitThisMonth < 0 ? 'var(--danger)' : 'inherit' }}>
                       ₹{p.profitThisMonth.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
      </div>
    </div>
  );
}
