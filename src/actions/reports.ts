"use server";
import prisma from '@/lib/prisma';

export async function getMonthlyComparisonData() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const sales = await prisma.invoice.findMany({
    where: { date: { gte: sixMonthsAgo } }
  });
  const purchases = await prisma.purchase.findMany({
    where: { date: { gte: sixMonthsAgo } }
  });
  const expenses = await prisma.expense.findMany({
    where: { date: { gte: sixMonthsAgo } }
  });

  // Group by month
  const dataMap = new Map<string, { name: string, income: number, expenses: number, profit: number }>();
  
  // Initialize last 6 months to ensure they all show up even if zero
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    dataMap.set(monthName, { name: monthName, income: 0, expenses: 0, profit: 0 });
  }

  sales.forEach(s => {
    const monthName = new Date(s.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (dataMap.has(monthName)) {
      dataMap.get(monthName)!.income += s.total;
    }
  });

  purchases.forEach(p => {
    const monthName = new Date(p.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (dataMap.has(monthName)) {
      dataMap.get(monthName)!.expenses += p.total;
    }
  });

  expenses.forEach(e => {
    const monthName = new Date(e.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (dataMap.has(monthName)) {
      dataMap.get(monthName)!.expenses += e.amount;
    }
  });

  // Calculate profit
  dataMap.forEach(v => {
    v.profit = v.income - v.expenses;
  });

  return Array.from(dataMap.values());
}
