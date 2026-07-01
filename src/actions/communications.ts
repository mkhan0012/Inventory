"use server";
import prisma from "@/lib/prisma";

export async function getCommunicationData() {
  // 1. Get Pending Dues Customers
  const dueCustomers = await prisma.customer.findMany({
    where: { dueAmount: { gt: 0 } },
    orderBy: { dueAmount: 'desc' }
  });

  // 2. Get Missing Clients (Purchased > 15 days ago, no recent purchases)
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - 15);

  // We find customers whose most recent invoice is older than 15 days
  // Or we just find customers who have totalPurchases > 0, but no invoices in last 15 days
  const activeCustomersRecently = await prisma.invoice.findMany({
    where: { date: { gte: daysAgo } },
    select: { customerId: true },
    distinct: ['customerId']
  });

  const activeCustomerIds = activeCustomersRecently.map(i => i.customerId);

  const missingCustomers = await prisma.customer.findMany({
    where: {
      totalPurchases: { gt: 0 },
      id: { notIn: activeCustomerIds }
    },
    orderBy: { totalPurchases: 'desc' }
  });

  return {
    dueCustomers,
    missingCustomers
  };
}
