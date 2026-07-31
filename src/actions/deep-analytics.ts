"use server";
import prisma from '@/lib/prisma';

export type DeepAnalyticsItem = {
  id: string;
  type: 'INVOICE' | 'DIRECT_SALE';
  saleId: string;
  saleNo: string;
  date: Date;
  customerName: string;
  productId: string;
  productCode: string;
  productName: string;
  category: string;
  quantity: number;
  rate: number;
  purchaseRate: number;
  grossRevenue: number;
  cogs: number;
  netProfit: number;
  marginPercent: number;
  currentStock: number;
};

export async function getDeepAnalytics(startDate?: Date, endDate?: Date): Promise<DeepAnalyticsItem[]> {
  const dateFilter: any = {};
  if (startDate) {
    dateFilter.gte = startDate;
  }
  if (endDate) {
    dateFilter.lte = endDate;
  }
  const dateCondition = Object.keys(dateFilter).length > 0 ? dateFilter : undefined;

  // Fetch Invoice Items
  const invoiceItems = await prisma.invoiceItem.findMany({
    where: dateCondition ? { invoice: { date: dateCondition } } : undefined,
    include: {
      product: true,
      invoice: {
        include: {
          customer: true
        }
      }
    }
  });

  // Fetch Direct Sale Items
  const directSaleItems = await prisma.directSaleItem.findMany({
    where: dateCondition ? { directSale: { date: dateCondition } } : undefined,
    include: {
      product: true,
      directSale: true
    }
  });

  const formattedData: DeepAnalyticsItem[] = [];

  invoiceItems.forEach(item => {
    const grossRevenue = item.rate * item.quantity;
    const cogs = item.purchaseRate * item.quantity;
    const netProfit = grossRevenue - cogs;
    const marginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    formattedData.push({
      id: item.id,
      type: 'INVOICE',
      saleId: item.invoiceId,
      saleNo: item.invoice.invoiceNo,
      date: item.invoice.date,
      customerName: item.invoice.customer.name,
      productId: item.productId,
      productCode: item.product.code,
      productName: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      rate: item.rate,
      purchaseRate: item.purchaseRate,
      grossRevenue,
      cogs,
      netProfit,
      marginPercent,
      currentStock: item.product.stock
    });
  });

  directSaleItems.forEach(item => {
    const grossRevenue = item.rate * item.quantity;
    const cogs = item.purchaseRate * item.quantity;
    const netProfit = grossRevenue - cogs;
    const marginPercent = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    formattedData.push({
      id: item.id,
      type: 'DIRECT_SALE',
      saleId: item.directSaleId,
      saleNo: item.directSale.saleNo,
      date: item.directSale.date,
      customerName: 'Walk-in Customer (Direct)',
      productId: item.productId,
      productCode: item.product.code,
      productName: item.product.name,
      category: item.product.category,
      quantity: item.quantity,
      rate: item.rate,
      purchaseRate: item.purchaseRate,
      grossRevenue,
      cogs,
      netProfit,
      marginPercent,
      currentStock: item.product.stock
    });
  });

  // Sort by date descending
  return formattedData.sort((a, b) => b.date.getTime() - a.date.getTime());
}
