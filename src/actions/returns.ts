"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getSalesReturns() {
  return await prisma.salesReturn.findMany({
    where: { isDeleted: false },
    include: {
      customer: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function processSalesReturn(data: {
  customerId?: string;
  reason?: string;
  items: Array<{ productId: string; quantity: number; refundAmount: number }>;
}) {
  const session = await getServerSession(authOptions);
  const totalAmount = data.items.reduce((sum, item) => sum + item.refundAmount, 0);

  const salesReturn = await prisma.$transaction(async (tx) => {
    // 1. Create the Return record
    const newReturn = await tx.salesReturn.create({
      data: {
        returnNo: `RET-${Date.now().toString().substring(7)}`,
        customerId: data.customerId,
        totalAmount,
        reason: data.reason,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            refundAmount: item.refundAmount
          }))
        }
      }
    });

    // 2. Revert stock for returned items
    for (const item of data.items) {
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
      
      const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
      
      await tx.product.update({
        where: { id: item.productId },
        data: { status }
      });

      await tx.stockLedger.create({
        data: {
          type: 'RETURN',
          quantity: item.quantity,
          balance: updatedProduct.stock,
          referenceId: newReturn.id,
          productId: item.productId
        }
      });
    }

    // 3. Adjust customer dues if applicable
    if (data.customerId) {
      const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
      if (customer) {
        // If they have pending dues, deduct from dues. Otherwise deduct from totalPurchases.
        if (customer.dueAmount > 0) {
          const dueReduction = Math.min(customer.dueAmount, totalAmount);
          await tx.customer.update({
            where: { id: data.customerId },
            data: { dueAmount: { decrement: dueReduction } }
          });
        }
      }
    }

    return newReturn;
  });

  if (session?.user) {
    await logActivity(
      "Process Return", 
      `Processed Return ${salesReturn.returnNo} for ₹${totalAmount}`, 
      session.user.name || "Unknown", 
      (session.user as any).role || "STAFF"
    );
  }

  revalidatePath('/inventory');
  revalidatePath('/customers');
  revalidatePath('/returns');
  return { success: true, id: salesReturn.id };
}
