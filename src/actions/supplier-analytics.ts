"use server";
import prisma from '@/lib/prisma';

export type SupplierAnalyticsItem = {
  id: string;
  name: string;
  phone: string | null;
  totalSuppliedValue: number;
  dueAmount: number;
  dependencyPercentage: number;
  purchaseCount: number;
  lastPurchaseDate: Date | null;
  priceTrend: 'INCREASING' | 'DECREASING' | 'STABLE' | 'UNKNOWN';
  avgPriceChangePercent: number;
};

export async function getSupplierAnalytics(): Promise<SupplierAnalyticsItem[]> {
  const suppliers = await prisma.supplier.findMany({
    include: {
      purchases: {
        include: {
          items: true
        }
      }
    }
  });

  const allPurchases = suppliers.flatMap(s => s.purchases);
  const totalGlobalPurchases = allPurchases.reduce((acc, p) => acc + p.total, 0);

  const analytics: SupplierAnalyticsItem[] = suppliers.map(supplier => {
    let totalSuppliedValue = 0;
    let purchaseCount = supplier.purchases.length;
    let lastPurchaseDate: Date | null = null;
    
    // To track price trends, we map productId to an array of {date, price}
    const productPrices = new Map<string, { date: Date, price: number }[]>();

    for (const purchase of supplier.purchases) {
      totalSuppliedValue += purchase.total;
      if (!lastPurchaseDate || purchase.date > lastPurchaseDate) {
        lastPurchaseDate = purchase.date;
      }

      for (const item of purchase.items) {
        if (!productPrices.has(item.productId)) {
          productPrices.set(item.productId, []);
        }
        productPrices.get(item.productId)!.push({ date: purchase.date, price: item.rate });
      }
    }

    if (totalSuppliedValue === 0 && supplier.totalSupplied > 0) {
      totalSuppliedValue = supplier.totalSupplied;
    }

    const dependencyPercentage = totalGlobalPurchases > 0 ? (totalSuppliedValue / totalGlobalPurchases) * 100 : 0;

    let totalChangePercent = 0;
    let trendProductsCount = 0;

    productPrices.forEach((priceHistory, productId) => {
      if (priceHistory.length > 1) {
        priceHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
        const oldestPrice = priceHistory[0].price;
        const newestPrice = priceHistory[priceHistory.length - 1].price;

        if (oldestPrice > 0) {
          const changePercent = ((newestPrice - oldestPrice) / oldestPrice) * 100;
          totalChangePercent += changePercent;
          trendProductsCount++;
        }
      }
    });

    const avgPriceChangePercent = trendProductsCount > 0 ? (totalChangePercent / trendProductsCount) : 0;
    
    let priceTrend: SupplierAnalyticsItem['priceTrend'] = 'UNKNOWN';
    if (trendProductsCount > 0) {
      if (avgPriceChangePercent > 2) priceTrend = 'INCREASING';
      else if (avgPriceChangePercent < -2) priceTrend = 'DECREASING';
      else priceTrend = 'STABLE';
    }

    return {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone,
      totalSuppliedValue,
      dueAmount: supplier.dueAmount,
      dependencyPercentage,
      purchaseCount,
      lastPurchaseDate,
      priceTrend,
      avgPriceChangePercent
    };
  });

  return analytics.sort((a, b) => b.totalSuppliedValue - a.totalSuppliedValue);
}
