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
  
  const allDirectSales = await prisma.directSale.findMany({
    include: { items: true }
  });

  // Fetch all active purchases for all-time calculation
  const allPurchases = await prisma.purchase.findMany();

  const monthlyInvoices = allInvoices.filter(inv => inv.date >= startOfMonth);
  const dailyInvoices = allInvoices.filter(inv => inv.date >= startOfDay);
  
  const monthlyDirectSales = allDirectSales.filter(ds => ds.date >= startOfMonth);
  const dailyDirectSales = allDirectSales.filter(ds => ds.date >= startOfDay);

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
  
  const allTimeActiveSales = allInvoices.reduce((acc, inv) => acc + inv.total, 0) + allDirectSales.reduce((acc, ds) => acc + ds.total, 0);
  const allTimeActiveProfit = calculateProfit(allInvoices) + calculateProfit(allDirectSales);
  const allTimeActivePurchases = allPurchases.reduce((acc, p) => acc + p.total, 0);
  
  const allTimeHistSales = historicalRecords.reduce((acc, r) => acc + r.sales, 0);
  const allTimeHistProfit = historicalRecords.reduce((acc, r) => acc + r.profit, 0);
  const allTimeHistPurchases = historicalRecords.reduce((acc, r) => acc + r.purchases, 0);

  const allTimeSales = allTimeActiveSales + allTimeHistSales;
  const allTimeProfit = allTimeActiveProfit + allTimeHistProfit;
  const allTimePurchases = allTimeActivePurchases + allTimeHistPurchases;

  const monthlyHistRecords = historicalRecords.filter(r => r.date >= startOfMonth);
  const dailyHistRecords = historicalRecords.filter(r => r.date >= startOfDay);

  let monthlySales = monthlyInvoices.reduce((acc, inv) => acc + inv.total, 0) + monthlyDirectSales.reduce((acc, ds) => acc + ds.total, 0);
  let todaysSales = dailyInvoices.reduce((acc, inv) => acc + inv.total, 0) + dailyDirectSales.reduce((acc, ds) => acc + ds.total, 0);

  let monthlyProfit = calculateProfit(monthlyInvoices) + calculateProfit(monthlyDirectSales);
  let todaysProfit = calculateProfit(dailyInvoices) + calculateProfit(dailyDirectSales);

  // Merge historical data into monthly/daily totals
  monthlySales += monthlyHistRecords.reduce((acc, r) => acc + r.sales, 0);
  monthlyProfit += monthlyHistRecords.reduce((acc, r) => acc + r.profit, 0);
  
  todaysSales += dailyHistRecords.reduce((acc, r) => acc + r.sales, 0);
  todaysProfit += dailyHistRecords.reduce((acc, r) => acc + r.profit, 0);

  const chartDataMonthMap = new Map<string, { sales: number, profit: number }>();
  
  monthlyInvoices.forEach(inv => {
    const day = inv.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!chartDataMonthMap.has(day)) {
      chartDataMonthMap.set(day, { sales: 0, profit: 0 });
    }
    const data = chartDataMonthMap.get(day)!;
    data.sales += inv.total;
    
    const invoiceProfit = inv.items.reduce((itemProfit: number, item: any) => {
      return itemProfit + ((item.rate - item.purchaseRate) * item.quantity);
    }, 0);
    
    data.profit += invoiceProfit;
  });

  monthlyDirectSales.forEach(ds => {
    const day = ds.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!chartDataMonthMap.has(day)) {
      chartDataMonthMap.set(day, { sales: 0, profit: 0 });
    }
    const data = chartDataMonthMap.get(day)!;
    data.sales += ds.total;
    
    const dsProfit = ds.items.reduce((itemProfit: number, item: any) => {
      return itemProfit + ((item.rate - item.purchaseRate) * item.quantity);
    }, 0);
    
    data.profit += dsProfit;
  });

  monthlyHistRecords.forEach(rec => {
    const day = rec.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    if (!chartDataMonthMap.has(day)) {
      chartDataMonthMap.set(day, { sales: 0, profit: 0 });
    }
    const data = chartDataMonthMap.get(day)!;
    data.sales += rec.sales;
    data.profit += rec.profit;
  });

  const chartDataMonth = Array.from(chartDataMonthMap.entries()).map(([name, data]) => ({
    name,
    sales: data.sales,
    profit: data.profit
  }));

  const buildMonthlyBuckets = (monthsBack: number) => {
    const dataMap = new Map<string, { sales: number, profit: number }>();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - (monthsBack - 1));
    startDate.setDate(1);
    startDate.setHours(0,0,0,0);

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthName = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      dataMap.set(monthName, { sales: 0, profit: 0 });
    }

    const addData = (date: Date, sales: number, profit: number) => {
      if (date >= startDate) {
        const monthName = new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        if (dataMap.has(monthName)) {
          const entry = dataMap.get(monthName)!;
          entry.sales += sales;
          entry.profit += profit;
        }
      }
    };

    allInvoices.forEach(inv => {
      const invProfit = inv.items.reduce((acc: number, item: any) => acc + ((item.rate - item.purchaseRate) * item.quantity), 0);
      addData(inv.date, inv.total, invProfit);
    });

    allDirectSales.forEach(ds => {
      const dsProfit = ds.items.reduce((acc: number, item: any) => acc + ((item.rate - item.purchaseRate) * item.quantity), 0);
      addData(ds.date, ds.total, dsProfit);
    });

    historicalRecords.forEach(rec => {
      addData(rec.date, rec.sales, rec.profit);
    });

    return Array.from(dataMap.entries()).map(([name, data]) => ({ name, sales: data.sales, profit: data.profit }));
  };

  const chartData = {
    month: chartDataMonth,
    sixMonths: buildMonthlyBuckets(6),
    year: buildMonthlyBuckets(12)
  };

  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { pct: current > 0 ? 100 : 0, isUp: current >= 0 };
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return { pct: Math.abs(pct).toFixed(1), isUp: pct >= 0 };
  };

  const sixMonthsData = chartData.sixMonths;
  const currentMonthData = sixMonthsData[sixMonthsData.length - 1];
  const lastMonthData = sixMonthsData[sixMonthsData.length - 2];
  const previous5Months = sixMonthsData.slice(0, 5);
  const avgSales5Months = previous5Months.reduce((a, b) => a + b.sales, 0) / 5;
  const avgProfit5Months = previous5Months.reduce((a, b) => a + b.profit, 0) / 5;

  const trends = {
    salesVsLastMonth: getTrend(currentMonthData.sales, lastMonthData.sales),
    profitVsLastMonth: getTrend(currentMonthData.profit, lastMonthData.profit),
    salesVs6MonthAvg: getTrend(currentMonthData.sales, avgSales5Months),
    profitVs6MonthAvg: getTrend(currentMonthData.profit, avgProfit5Months)
  };

  const recentInvoices = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  });

  const recentDirectSales = await prisma.directSale.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  const recentSales = [
    ...recentInvoices.map(i => ({
      id: i.id,
      invoiceNo: i.invoiceNo,
      date: i.date,
      customerName: i.customer.name,
      total: i.total,
      status: i.status,
      type: 'INVOICE'
    })),
    ...recentDirectSales.map(d => ({
      id: d.id,
      invoiceNo: d.saleNo,
      date: d.date,
      customerName: 'Direct / Walk-in',
      total: d.total,
      status: 'PAID',
      type: 'DIRECT'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 5);

  return {
    allTimeSales,
    allTimeProfit,
    allTimePurchases,
    stockValue,
    todaysSales,
    todaysProfit,
    monthlySales,
    monthlyProfit,
    duePayments,
    lowStockProducts,
    outOfStockProducts,
    recentSales,
    chartData,
    trends
  };
}
