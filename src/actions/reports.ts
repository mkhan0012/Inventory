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
  let currentIterDate = new Date(earliestDate);
  
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
