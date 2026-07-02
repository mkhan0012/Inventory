"use server";
import prisma from "@/lib/prisma";

export async function getDashboardStats() {
  const products = await prisma.product.findMany();
  const stockValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);
  
  const lowStockProducts = products.filter(p => p.stock <= 10 && p.stock > 0).slice(0, 5);
  const outOfStockProducts = products.filter(p => p.stock === 0).slice(0, 5);

  const customers = await prisma.customer.findMany();
  const duePayments = customers.reduce((acc, c) => acc + c.dueAmount, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // Fetch all active invoices for all-time calculation
  const allInvoices = await prisma.invoice.findMany({
    include: { items: true }
  });

  const monthlyInvoices = allInvoices.filter(inv => inv.date >= startOfMonth);
  const dailyInvoices = allInvoices.filter(inv => inv.date >= startOfDay);

  const calculateProfit = (invoices: any[]) => {
    return invoices.reduce((totalProfit, inv) => {
      const invoiceProfit = inv.items.reduce((itemProfit: number, item: any) => {
        return itemProfit + ((item.rate - item.purchaseRate) * item.quantity);
      }, 0);
      return totalProfit + invoiceProfit;
    }, 0);
  };

  // Fetch all historical records
  const historicalRecords = await prisma.historicalRecord.findMany();
  
  const allTimeActiveSales = allInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const allTimeActiveProfit = calculateProfit(allInvoices);
  
  const allTimeHistSales = historicalRecords.reduce((acc, r) => acc + r.sales, 0);
  const allTimeHistProfit = historicalRecords.reduce((acc, r) => acc + r.profit, 0);

  const allTimeSales = allTimeActiveSales + allTimeHistSales;
  const allTimeProfit = allTimeActiveProfit + allTimeHistProfit;

  const monthlyHistRecords = historicalRecords.filter(r => r.date >= startOfMonth);
  const dailyHistRecords = historicalRecords.filter(r => r.date >= startOfDay);

  let monthlySales = monthlyInvoices.reduce((acc, inv) => acc + inv.total, 0);
  let todaysSales = dailyInvoices.reduce((acc, inv) => acc + inv.total, 0);

  let monthlyProfit = calculateProfit(monthlyInvoices);
  let todaysProfit = calculateProfit(dailyInvoices);

  // Merge historical data into monthly/daily totals
  monthlySales += monthlyHistRecords.reduce((acc, r) => acc + r.sales, 0);
  monthlyProfit += monthlyHistRecords.reduce((acc, r) => acc + r.profit, 0);
  
  todaysSales += dailyHistRecords.reduce((acc, r) => acc + r.sales, 0);
  todaysProfit += dailyHistRecords.reduce((acc, r) => acc + r.profit, 0);

  const chartDataMap = new Map<string, { sales: number, profit: number }>();
  
  monthlyInvoices.forEach(inv => {
    const day = inv.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!chartDataMap.has(day)) {
      chartDataMap.set(day, { sales: 0, profit: 0 });
    }
    const data = chartDataMap.get(day)!;
    data.sales += inv.total;
    
    const invoiceProfit = inv.items.reduce((itemProfit: number, item: any) => {
      return itemProfit + ((item.rate - item.purchaseRate) * item.quantity);
    }, 0);
    
    data.profit += invoiceProfit;
  });

  // Merge historical records into chart data
  monthlyHistRecords.forEach(rec => {
    const day = rec.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!chartDataMap.has(day)) {
      chartDataMap.set(day, { sales: 0, profit: 0 });
    }
    const data = chartDataMap.get(day)!;
    data.sales += rec.sales;
    data.profit += rec.profit;
  });

  const chartData = Array.from(chartDataMap.entries()).map(([name, data]) => ({
    name,
    sales: data.sales,
    profit: data.profit
  }));

  const recentSales = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  });

  return {
    allTimeSales,
    allTimeProfit,
    stockValue,
    todaysSales,
    todaysProfit,
    monthlySales,
    monthlyProfit,
    duePayments,
    lowStockProducts,
    outOfStockProducts,
    recentSales,
    chartData
  };
}
