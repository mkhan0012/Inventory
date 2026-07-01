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
    }
  });

  const dailyInvoices = await prisma.invoice.findMany({
    where: {
      date: { gte: startOfDay }
    }
  });

  const monthlySales = monthlyInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const todaysSales = dailyInvoices.reduce((acc, inv) => acc + inv.total, 0);

  const recentSales = await prisma.invoice.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { customer: true }
  });

  return {
    stockValue,
    todaysSales,
    monthlySales,
    duePayments,
    lowStockProducts,
    outOfStockProducts,
    recentSales
  };
}
