"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getMonthProfit(year: number, month: number) {
  // Month is 0-indexed in JS Dates
  const startDate = new Date(year, month, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // Fetch all active invoices
  const invoices = await prisma.invoice.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { items: true }
  });
  
  const directSales = await prisma.directSale.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: { items: true }
  });

  const expenses = await prisma.expense.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const historicalRecords = await prisma.historicalRecord.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const purchases = await prisma.purchase.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    }
  });

  const totalSales = invoices.reduce((acc, inv) => acc + inv.total, 0) + directSales.reduce((acc, ds) => acc + ds.total, 0) + historicalRecords.reduce((acc, h) => acc + h.sales, 0);
  const totalPurchases = purchases.reduce((acc, pur) => acc + pur.total, 0) + historicalRecords.reduce((acc, h) => acc + h.purchases, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return totalSales - totalPurchases - totalExpenses;
}

export async function getProfitAllocations(year: number, month: number) {
  const startDate = new Date(year, month, 1, 0, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  const allocations = await prisma.profitAllocation.findMany({
    where: {
      month: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: {
      date: 'desc'
    }
  });

  return allocations;
}

export async function addProfitAllocation(data: { year: number, month: number, description: string, amount: number }) {
  const monthDate = new Date(data.year, data.month, 1, 12, 0, 0, 0); // middle of the day to avoid timezone shifts

  await prisma.profitAllocation.create({
    data: {
      month: monthDate,
      description: data.description,
      amount: data.amount,
    }
  });

  revalidatePath("/profit-management");
}

export async function deleteProfitAllocation(id: string) {
  await prisma.profitAllocation.delete({
    where: { id }
  });
  revalidatePath("/profit-management");
}
