"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getQuotations() {
  return await prisma.quotation.findMany({
    include: {
      customer: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createQuotation(data: {
  customerId: string;
  items: Array<{ productId: string; quantity: number; rate: number }>;
  tax: number;
  date?: string;
}) {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const total = subtotal + data.tax;

  const quotation = await prisma.$transaction(async (tx) => {
    return await tx.quotation.create({
      data: {
        quoteNo: `EST-${Date.now().toString().substring(7)}`,
        date: data.date ? new Date(data.date) : undefined,
        customerId: data.customerId,
        subtotal,
        tax: data.tax,
        total,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            rate: item.rate,
            amount: item.quantity * item.rate
          }))
        }
      }
    });
  });

  revalidatePath('/quotations');
  return quotation;
}
