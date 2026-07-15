"use server";
import prisma from '@/lib/prisma';

export async function getMonthlyComparisonData() {
  const sales = await prisma.invoice.findMany();
  const purchases = await prisma.purchase.findMany();
  const expenses = await prisma.expense.findMany();
  const historical = await prisma.historicalRecord.findMany();
  const directSales = await prisma.directSale.findMany();

  // Find the earliest date
  let earliestDate = new Date();
  const allDates = [
    ...sales.map(s => s.date),
    ...directSales.map(d => d.date),
    ...purchases.map(p => p.date),
    ...expenses.map(e => e.date),
    ...historical.map(h => h.date)
  ];
  
  if (allDates.length > 0) {
    earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
  }
  
  // Ensure it starts from the 1st of the earliest month
  earliestDate.setDate(1);
  earliestDate.setHours(0, 0, 0, 0);

  const dataMap = new Map<string, { name: string, income: number, expenses: number, profit: number }>();
  
  // Generate all months from earliest to current
  const currentDate = new Date();
  const currentIterDate = new Date(earliestDate);
  
  while (currentIterDate <= currentDate) {
    const monthName = currentIterDate.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    dataMap.set(monthName, { name: monthName, income: 0, expenses: 0, profit: 0 });
    currentIterDate.setMonth(currentIterDate.getMonth() + 1);
  }

  // Populate data
  const addToMap = (date: Date, key: 'income' | 'expenses', amount: number) => {
    const monthName = new Date(date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (dataMap.has(monthName)) {
      dataMap.get(monthName)![key] += amount;
    }
  };

  sales.forEach(s => addToMap(s.date, 'income', s.total));
  directSales.forEach(d => addToMap(d.date, 'income', d.total));
  purchases.forEach(p => addToMap(p.date, 'expenses', p.total));
  expenses.forEach(e => addToMap(e.date, 'expenses', e.amount));
  
  historical.forEach(h => {
    addToMap(h.date, 'income', h.sales);
    addToMap(h.date, 'expenses', h.purchases);
  });

  let totalIncome = 0;
  let totalExpensesSum = 0;
  let totalProfit = 0;

  // Calculate profit and totals
  dataMap.forEach(v => {
    v.profit = v.income - v.expenses;
    totalIncome += v.income;
    totalExpensesSum += v.expenses;
    totalProfit += v.profit;
  });

  const chartData = Array.from(dataMap.values());
  const monthCount = chartData.length > 0 ? chartData.length : 1;

  return {
    chartData,
    averages: {
      income: totalIncome / monthCount,
      expenses: totalExpensesSum / monthCount,
      profit: totalProfit / monthCount
    }
  };
}

export async function getAdvancedBiData(startOfMonthStr: string, endOfMonthStr: string) {
  const startOfMonth = new Date(startOfMonthStr);
  const endOfMonth = new Date(endOfMonthStr);

  // --- YoY Growth Calculation ---
  const startOfLastYear = new Date(startOfMonth);
  startOfLastYear.setFullYear(startOfLastYear.getFullYear() - 1);
  const endOfLastYear = new Date(endOfMonth);
  endOfLastYear.setFullYear(endOfLastYear.getFullYear() - 1);

  const thisMonthSales = await prisma.invoice.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth } }, include: { items: true } });
  const thisMonthDirect = await prisma.directSale.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth } }, include: { items: true } });
  const thisMonthHist = await prisma.historicalRecord.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth } } });
  const thisMonthExpenses = await prisma.expense.findMany({ where: { date: { gte: startOfMonth, lte: endOfMonth } } });

  const lastYearSales = await prisma.invoice.findMany({ where: { date: { gte: startOfLastYear, lte: endOfLastYear } }, include: { items: true } });
  const lastYearDirect = await prisma.directSale.findMany({ where: { date: { gte: startOfLastYear, lte: endOfLastYear } }, include: { items: true } });
  const lastYearHist = await prisma.historicalRecord.findMany({ where: { date: { gte: startOfLastYear, lte: endOfLastYear } } });

  const tmTotalRevenue = thisMonthSales.reduce((a, b) => a + b.total, 0) + thisMonthDirect.reduce((a, b) => a + b.total, 0) + thisMonthHist.reduce((a, b) => a + b.sales, 0);
  const tmCogs = thisMonthSales.reduce((a, inv) => a + inv.items.reduce((sum, item) => sum + (item.purchaseRate * item.quantity), 0), 0) + thisMonthDirect.reduce((a, ds) => a + ds.items.reduce((sum, item) => sum + (item.purchaseRate * item.quantity), 0), 0);
  
  const tmHistCogs = thisMonthHist.reduce((a, b) => a + (b.sales - b.profit), 0);
  const totalCogs = tmCogs + tmHistCogs;
  const grossProfit = tmTotalRevenue - totalCogs;
  const totalExpenses = thisMonthExpenses.reduce((a, b) => a + b.amount, 0);
  const netProfit = grossProfit - totalExpenses;

  // Last Year Calculations
  const lyTotalRevenue = lastYearSales.reduce((a, b) => a + b.total, 0) + lastYearDirect.reduce((a, b) => a + b.total, 0) + lastYearHist.reduce((a, b) => a + b.sales, 0);
  const lyCogs = lastYearSales.reduce((a, inv) => a + inv.items.reduce((sum, item) => sum + (item.purchaseRate * item.quantity), 0), 0) + lastYearDirect.reduce((a, ds) => a + ds.items.reduce((sum, item) => sum + (item.purchaseRate * item.quantity), 0), 0);
  const lyHistCogs = lastYearHist.reduce((a, b) => a + (b.sales - b.profit), 0);
  
  const lyTotalCogs = lyCogs + lyHistCogs;
  const lyGrossProfit = lyTotalRevenue - lyTotalCogs;

  const yoySalesGrowth = lyTotalRevenue === 0 ? (tmTotalRevenue > 0 ? 100 : 0) : ((tmTotalRevenue - lyTotalRevenue) / lyTotalRevenue) * 100;
  const yoyProfitGrowth = lyGrossProfit === 0 ? (grossProfit > 0 ? 100 : 0) : ((grossProfit - lyGrossProfit) / Math.abs(lyGrossProfit)) * 100;

  // --- Category Analytics ---
  const invoiceItemsWithProduct = await prisma.invoiceItem.findMany({
    where: { invoice: { date: { gte: startOfMonth, lte: endOfMonth } } },
    include: { product: true }
  });
  const dsItemsWithProduct = await prisma.directSaleItem.findMany({
    where: { directSale: { date: { gte: startOfMonth, lte: endOfMonth } } },
    include: { product: true }
  });

  const categoryMap = new Map<string, { revenue: number, profit: number }>();
  
  const addCategoryData = (category: string, revenue: number, profit: number) => {
    if (!categoryMap.has(category)) categoryMap.set(category, { revenue: 0, profit: 0 });
    const data = categoryMap.get(category)!;
    data.revenue += revenue;
    data.profit += profit;
  };

  invoiceItemsWithProduct.forEach(item => {
    addCategoryData(item.product.category, item.amount, (item.rate - item.purchaseRate) * item.quantity);
  });
  dsItemsWithProduct.forEach(item => {
    addCategoryData(item.product.category, item.amount, (item.rate - item.purchaseRate) * item.quantity);
  });

  const categoryData = Array.from(categoryMap.entries()).map(([name, value]) => ({
    name,
    value: value.revenue,
    profit: value.profit
  })).sort((a, b) => b.value - a.value);

  // --- Shop Heatmap (Day of Week) ---
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const heatmapMap = new Map<string, number>();
  dayNames.forEach(d => heatmapMap.set(d, 0));

  thisMonthSales.forEach(inv => {
    const day = dayNames[inv.date.getDay()];
    heatmapMap.set(day, heatmapMap.get(day)! + inv.total);
  });
  thisMonthDirect.forEach(ds => {
    const day = dayNames[ds.date.getDay()];
    heatmapMap.set(day, heatmapMap.get(day)! + ds.total);
  });

  const heatmapData = dayNames.map(day => ({
    day,
    sales: heatmapMap.get(day)!
  }));

  return {
    waterfall: [
      { name: 'Revenue', value: tmTotalRevenue },
      { name: 'COGS', value: -totalCogs },
      { name: 'Gross Profit', value: grossProfit, isTotal: true },
      { name: 'Expenses', value: -totalExpenses },
      { name: 'Net Profit', value: netProfit, isTotal: true }
    ],
    yoy: {
      salesGrowth: yoySalesGrowth,
      profitGrowth: yoyProfitGrowth,
      lastYearSales: lyTotalRevenue,
      lastYearProfit: lyGrossProfit
    },
    categoryData,
    heatmapData
  };
}
