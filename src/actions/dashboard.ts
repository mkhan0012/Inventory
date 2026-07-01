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

  const monthlyInvoices = await prisma.invoice.findMany({
    where: {
      date: { gte: startOfMonth }
    },
    include: { items: true },
    orderBy: { date: 'asc' }
  });

  const dailyInvoices = await prisma.invoice.findMany({
    where: {
      date: { gte: startOfDay }
    },
    include: { items: true }
  });

  const monthlySales = monthlyInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const todaysSales = dailyInvoices.reduce((acc, inv) => acc + inv.total, 0);

  const calculateProfit = (invoices: any[]) => {
    return invoices.reduce((totalProfit, inv) => {
      const invoiceProfit = inv.items.reduce((itemProfit: number, item: any) => {
        return itemProfit + ((item.rate - item.purchaseRate) * item.quantity);
      }, 0);
      return totalProfit + invoiceProfit;
    }, 0);
  };

  const monthlyProfit = calculateProfit(monthlyInvoices);
  const todaysProfit = calculateProfit(dailyInvoices);

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
