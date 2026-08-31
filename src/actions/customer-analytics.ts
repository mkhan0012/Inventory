"use server";
import prisma from '@/lib/prisma';

export type CustomerAnalyticsItem = {
  id: string;
  name: string;
  phone: string | null;
  totalRevenue: number;
  totalProfit: number;
  marginPercent: number;
  dueAmount: number;
  dueThisMonth: number;
  lastPurchaseDate: Date | null;
  purchaseCount: number;
  segment: 'VIP' | 'ACTIVE' | 'AT_RISK' | 'DORMANT' | 'NEW';
};

export async function getCustomerAnalytics(): Promise<CustomerAnalyticsItem[]> {
  const customers = await prisma.customer.findMany({
    include: {
      invoices: {
        include: {
          items: true
        }
      }
    }
  });

  const now = new Date();
  
  const analytics: CustomerAnalyticsItem[] = customers.map(customer => {
    let totalRevenue = 0;
    let totalCogs = 0;
    let lastPurchaseDate: Date | null = null;
    let purchaseCount = customer.invoices.length;
    let dueThisMonth = 0;

    for (const invoice of customer.invoices) {
      totalRevenue += invoice.total;
      
      for (const item of invoice.items) {
        totalCogs += (item.purchaseRate * item.quantity);
      }

      if (!lastPurchaseDate || invoice.date > lastPurchaseDate) {
        lastPurchaseDate = invoice.date;
      }

      if (
        invoice.status === 'DUE' &&
        invoice.date.getMonth() === now.getMonth() &&
        invoice.date.getFullYear() === now.getFullYear()
      ) {
        dueThisMonth += invoice.total;
      }
    }

    // If totalRevenue from invoices is 0 but customer has totalPurchases from history, 
    // we use totalPurchases for revenue, but we can't know profit.
    if (totalRevenue === 0 && customer.totalPurchases > 0) {
      totalRevenue = customer.totalPurchases;
      totalCogs = totalRevenue * 0.8; // Estimate 20% margin if no invoice data
    }

    const totalProfit = totalRevenue - totalCogs;
    const marginPercent = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    let segment: CustomerAnalyticsItem['segment'] = 'NEW';
    
    if (lastPurchaseDate) {
      const daysSinceLastPurchase = Math.floor((now.getTime() - lastPurchaseDate.getTime()) / (1000 * 3600 * 24));
      
      if (purchaseCount > 5 && totalProfit > 5000 && daysSinceLastPurchase < 30) {
        segment = 'VIP';
      } else if (daysSinceLastPurchase < 60) {
        segment = 'ACTIVE';
      } else if (daysSinceLastPurchase < 120) {
        segment = 'AT_RISK';
      } else {
        segment = 'DORMANT';
      }
    }

    return {
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      totalRevenue,
      totalProfit,
      marginPercent,
      dueAmount: customer.dueAmount,
      dueThisMonth,
      lastPurchaseDate,
      purchaseCount,
      segment
    };
  });

  // Sort by total profit descending
  return analytics.sort((a, b) => b.totalProfit - a.totalProfit);
}
