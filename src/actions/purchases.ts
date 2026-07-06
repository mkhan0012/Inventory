"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getPurchases(search?: string) {
  return await prisma.purchase.findMany({
    where: search ? {
      OR: [
        { purchaseNo: { contains: search } },
        { supplier: { name: { contains: search } } }
      ]
    } : undefined,
    include: {
      supplier: true,
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createPurchase(data: {
  supplierId: string;
  items: Array<{ productId: string; quantity: number; rate: number }>;
  status: string; // "PAID" | "DUE"
  date?: string;
}) {
  const total = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  const purchase = await prisma.$transaction(async (tx) => {
    // 1. Update stock
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true } });
      if (!product) throw new Error("Product not found");
      
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: item.quantity } }
      });
      
      const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
      await tx.product.update({
        where: { id: item.productId },
        data: { status }
      });
    }

    // 2. Create Purchase
    const newPurchase = await tx.purchase.create({
      data: {
        purchaseNo: `PUR-${Date.now().toString().substring(7)}`,
        date: data.date ? new Date(data.date) : undefined,
        supplierId: data.supplierId,
        total,
        status: data.status,
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

    // 3. Update Supplier
    const dueAmountIncrement = data.status === 'DUE' ? total : 0;
    
    await tx.supplier.update({
      where: { id: data.supplierId },
      data: {
        totalSupplied: { increment: total },
        dueAmount: { increment: dueAmountIncrement }
      }
    });

    return newPurchase;
  });

  revalidatePath('/purchases');
  revalidatePath('/inventory');
  revalidatePath('/suppliers');
  revalidatePath('/');
  return { success: true, id: purchase.id };
}

export async function deletePurchase(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete purchases." };
  }
  const userName = session.user.name || "Unknown";

  try {
    await prisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({ where: { id }, include: { items: true } });
      if (!purchase) throw new Error("Purchase not found.");

      // Reverse Supplier amounts
      await tx.supplier.update({
        where: { id: purchase.supplierId },
        data: {
          totalSupplied: { decrement: purchase.total },
          dueAmount: { decrement: purchase.status === 'DUE' ? purchase.total : 0 }
        }
      });

      // Reverse Product stock
      for (const item of purchase.items) {
        const updatedProduct = await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        if (updatedProduct.stock < 0) {
          throw new Error(`Cannot delete purchase: Items have already been sold. Reversing this purchase would result in negative stock.`);
        }

        const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
        await tx.product.update({
          where: { id: item.productId },
          data: { status }
        });
      }

      // Delete Purchase
      await tx.purchase.delete({ where: { id } });

      await logActivity(
        "Delete Purchase", 
        `Deleted Purchase ${purchase.purchaseNo} (₹${purchase.total})`, 
        userName, 
        "OWNER"
      );
    }, { maxWait: 15000, timeout: 15000 });

    revalidatePath('/purchases');
    revalidatePath('/inventory');
    revalidatePath('/suppliers');
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}
