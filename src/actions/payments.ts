"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  return await prisma.payment.findMany({
    include: {
      customer: true,
      supplier: true
    },
    orderBy: { date: 'desc' }
  });
}

export async function createPayment(data: {
  amount: number;
  type: string; // "INCOMING" | "OUTGOING"
  method: string;
  customerId?: string;
  supplierId?: string;
}) {
  const payment = await prisma.$transaction(async (tx) => {
    const newPayment = await tx.payment.create({ data });

    if (data.type === 'INCOMING' && data.customerId) {
      await tx.customer.update({
        where: { id: data.customerId },
        data: { dueAmount: { decrement: data.amount } }
      });
    } else if (data.type === 'OUTGOING' && data.supplierId) {
      await tx.supplier.update({
        where: { id: data.supplierId },
        data: { dueAmount: { decrement: data.amount } }
      });
    }

    return newPayment;
  });

  revalidatePath('/payments');
  revalidatePath('/customers');
  revalidatePath('/suppliers');
  revalidatePath('/');
  return { success: true, id: payment.id };
}
