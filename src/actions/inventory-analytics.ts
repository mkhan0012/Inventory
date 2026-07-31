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
