"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getStockAdjustments(search?: string) {
  return await prisma.stockAdjustment.findMany({
    where: {
      isDeleted: false,
      ...(search ? {
        OR: [
          { adjustNo: { contains: search } },
          { reason: { contains: search } }
        ]
      } : {})
    },
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createStockAdjustment(data: {
  reason: string;
  notes?: string;
  items: Array<{ productId: string; quantityChanged: number }>;
  date?: string;
}) {
  try {
    const adjustment = await prisma.$transaction(async (tx) => {
      const newAdj = await tx.stockAdjustment.create({
        data: {
          adjustNo: `ADJ-${Date.now().toString().substring(7)}`,
          date: data.date ? new Date(data.date) : undefined,
          reason: data.reason,
          notes: data.notes,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantityChanged: item.quantityChanged
            }))
          }
        }
      });

      for (const item of data.items) {
        if (item.quantityChanged === 0) continue;

        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error("Product not found");

        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantityChanged } }
        });

        const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
        
        await tx.product.update({
          where: { id: item.productId },
          data: { status }
        });

        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            type: 'ADJUSTMENT',
            quantity: item.quantityChanged,
            balance: updatedProduct.stock,
            referenceId: newAdj.id,
            notes: data.reason
          }
        });
      }

      return newAdj;
    });

    const session = await getServerSession(authOptions);
    if (session?.user) {
      await logActivity(
        "Stock Adjustment", 
        `Adjusted stock for ${data.items.length} items. Reason: ${data.reason}`, 
        session.user.name || "Unknown", 
        (session.user as any).role || "STAFF"
      );
    }

    revalidatePath('/inventory/adjustments');
    revalidatePath('/inventory');
    return { success: true, id: adjustment.id };
  } catch (e: any) {
    return { error: e.message || "Failed to create Stock Adjustment." };
  }
}

export async function deleteStockAdjustment(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete records." };
  }
  const userName = session.user.name || "Unknown";

  try {
    await prisma.$transaction(async (tx) => {
      const adjustment = await tx.stockAdjustment.findUnique({ where: { id }, include: { items: true } });
      if (!adjustment) throw new Error("Adjustment not found.");

      for (const item of adjustment.items) {
        if (item.quantityChanged === 0) continue;

        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantityChanged } }
        });
        
        const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
        
        await tx.product.update({
          where: { id: item.productId },
          data: { status }
        });

        await tx.stockLedger.create({
          data: {
            productId: item.productId,
            type: 'ADJUSTMENT',
            quantity: -item.quantityChanged,
            balance: updatedProduct.stock,
            referenceId: adjustment.id,
            notes: "Reverted Adjustment"
          }
        });
      }

      await tx.stockAdjustment.update({ 
        where: { id },
        data: { isDeleted: true }
      });

      await logActivity(
        "Delete Stock Adjustment", 
        `Deleted Adjustment ${adjustment.adjustNo}`, 
        userName, 
        "OWNER"
      );
    });

    revalidatePath('/inventory/adjustments');
    revalidatePath('/inventory');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}
