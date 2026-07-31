"use server";
import prisma from '@/lib/prisma';

export type InventoryHealthItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  currentStock: number;
  stockValue: number;
  lastSaleDate: Date | null;
  totalUnitsSold: number;
  status: 'DEAD_STOCK' | 'SLOW_MOVING' | 'HEALTHY' | 'FAST_MOVING';
  daysSinceLastSale: number | null;
};

export async function getInventoryHealth(): Promise<InventoryHealthItem[]> {
  const products = await prisma.product.findMany({
    include: {
      invoiceItems: {
        include: {
          invoice: true
        }
      },
      directSaleItems: {
        include: {
          directSale: true
        }
      }
    }
  });

  const now = new Date();
  
  const healthData: InventoryHealthItem[] = products.map(product => {
    let lastSaleDate: Date | null = null;
    let totalUnitsSold = 0;

    // Check Invoices
    for (const item of product.invoiceItems) {
      totalUnitsSold += item.quantity;
      if (!lastSaleDate || item.invoice.date > lastSaleDate) {
        lastSaleDate = item.invoice.date;
      }
    }

    // Check Direct Sales
    for (const item of product.directSaleItems) {
      totalUnitsSold += item.quantity;
      if (!lastSaleDate || item.directSale.date > lastSaleDate) {
        lastSaleDate = item.directSale.date;
      }
    }

    const stockValue = product.stock * product.purchasePrice;
    
    let daysSinceLastSale = null;
    if (lastSaleDate) {
      daysSinceLastSale = Math.floor((now.getTime() - lastSaleDate.getTime()) / (1000 * 3600 * 24));
    }

    let status: InventoryHealthItem['status'] = 'HEALTHY';
    
    if (product.stock > 0) {
      if (daysSinceLastSale === null) {
        // Never sold but in stock. If older than 30 days, dead stock.
        const age = Math.floor((now.getTime() - product.createdAt.getTime()) / (1000 * 3600 * 24));
        status = age > 60 ? 'DEAD_STOCK' : 'SLOW_MOVING';
      } else if (daysSinceLastSale > 90) {
        status = 'DEAD_STOCK';
      } else if (daysSinceLastSale > 45) {
        status = 'SLOW_MOVING';
      } else if (daysSinceLastSale < 14 && totalUnitsSold > 20) {
        status = 'FAST_MOVING';
      }
    } else {
      status = totalUnitsSold > 50 ? 'FAST_MOVING' : 'HEALTHY';
    }

    return {
      id: product.id,
      code: product.code,
      name: product.name,
      category: product.category,
      currentStock: product.stock,
      stockValue,
      lastSaleDate,
      totalUnitsSold,
      status,
      daysSinceLastSale
    };
  });

  // Sort by stock value descending to highlight tied up capital
  return healthData.sort((a, b) => b.stockValue - a.stockValue);
}

export async function getInventoryAnalytics() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get all products
  const products = await prisma.product.findMany();

  // Get all sales items from the last 30 days
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: { invoice: { date: { gte: thirtyDaysAgo } } }
  });
  
  const directSaleItems = await prisma.directSaleItem.findMany({
    where: { directSale: { date: { gte: thirtyDaysAgo } } }
  });

  const productStats = products.map(p => {
    const invItems = invoiceItems.filter(i => i.productId === p.id);
    const dsItems = directSaleItems.filter(i => i.productId === p.id);

    const totalSold30Days = 
      invItems.reduce((acc, curr) => acc + curr.quantity, 0) + 
      dsItems.reduce((acc, curr) => acc + curr.quantity, 0);

    const revenue30Days = 
      invItems.reduce((acc, curr) => acc + curr.amount, 0) + 
      dsItems.reduce((acc, curr) => acc + curr.amount, 0);

    const velocityPerDay = totalSold30Days / 30;
    
    // Days of stock remaining (if velocity > 0)
    const daysRemaining = velocityPerDay > 0 ? Math.floor(p.stock / velocityPerDay) : null;
    
    // Determine status badge
    let badge = 'NORMAL';
    if (daysRemaining !== null && daysRemaining <= 7 && p.stock > 0) {
      badge = 'REORDER_SOON';
    }
    if (p.stock === 0) {
      badge = 'OUT_OF_STOCK';
    } else if (velocityPerDay > 2) {
      badge = 'FAST_MOVING';
    } else if (velocityPerDay === 0 && p.stock > 0 && p.createdAt < thirtyDaysAgo) {
      badge = 'DEAD_STOCK';
    }

    return {
      productId: p.id,
      totalSold30Days,
      revenue30Days,
      velocityPerDay,
      daysRemaining,
      badge
    };
  });

  // Calculate ABC Classification
  const totalRevenue = productStats.reduce((acc, p) => acc + p.revenue30Days, 0);
  
  // Sort by revenue descending
  const sortedByRevenue = [...productStats].sort((a, b) => b.revenue30Days - a.revenue30Days);
  
  let cumulativeRevenue = 0;
  const abcMap = new Map<string, 'A' | 'B' | 'C'>();
  
  sortedByRevenue.forEach(p => {
    cumulativeRevenue += p.revenue30Days;
    const percentage = totalRevenue > 0 ? cumulativeRevenue / totalRevenue : 0;
    
    if (percentage <= 0.70) {
      abcMap.set(p.productId, 'A'); // Top 70% of revenue
    } else if (percentage <= 0.90) {
      abcMap.set(p.productId, 'B'); // Next 20%
    } else {
      abcMap.set(p.productId, 'C'); // Bottom 10%
    }
  });

  const finalStats = productStats.map(p => ({
    ...p,
    abcClass: abcMap.get(p.productId) || 'C'
  }));

  // Create a quick lookup map for the client
  const analyticsMap = finalStats.reduce((acc, curr) => {
    acc[curr.productId] = curr;
    return acc;
  }, {} as Record<string, any>);

  return analyticsMap;
}