"use server";
import prisma from '@/lib/prisma';

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
