"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getLowStockAlerts() {
  return await prisma.product.findMany({
    where: { stock: { lte: 10 } },
    select: { id: true, name: true, stock: true },
    orderBy: { stock: 'asc' },
    take: 10
  });
}

export async function getProducts(search?: string) {
  const products = await prisma.product.findMany({
    where: search ? {
      OR: [
        { name: { contains: search } },
        { code: { contains: search } },
        { category: { contains: search } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' }
  });

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentInvoiceItems = await prisma.invoiceItem.findMany({
    where: {
      invoice: {
        date: { gte: thirtyDaysAgo }
      }
    }
  });

  const recentDirectSaleItems = await prisma.directSaleItem.findMany({
    where: {
      directSale: {
        date: { gte: thirtyDaysAgo }
      }
    }
  });

  const soldMap = new Map<string, number>();
  recentInvoiceItems.forEach(item => {
    soldMap.set(item.productId, (soldMap.get(item.productId) || 0) + item.quantity);
  });
  recentDirectSaleItems.forEach(item => {
    soldMap.set(item.productId, (soldMap.get(item.productId) || 0) + item.quantity);
  });

  return products.map(p => {
    const totalSoldLast30Days = soldMap.get(p.id) || 0;
    const velocityPerDay = totalSoldLast30Days / 30;
    let daysUntilEmpty = -1;
    
    if (velocityPerDay > 0) {
      daysUntilEmpty = Math.floor(p.stock / velocityPerDay);
    } else if (p.stock === 0) {
      daysUntilEmpty = 0;
    }

    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      velocityPerDay,
      daysUntilEmpty
    };
  });
}

import { z } from "zod";

const productSchema = z.object({
  code: z.string().min(1, "Item Code is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  category: z.string().min(1, "Category is required"),
  stock: z.number().min(0, "Stock cannot be negative"),
  location: z.string().min(1, "Location is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0.01, "Price must be at least 0.01"),
  purchasePrice: z.number().min(0, "Purchase price cannot be negative")
});

export async function createProduct(data: {
  code: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  unit: string;
  price: number;
  purchasePrice: number;
}) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map(e => e.message).join(", "));
  }
  const status = data.stock > 10 ? 'In Stock' : data.stock > 0 ? 'Low Stock' : 'Out of Stock';
  
  const product = await prisma.product.create({
    data: {
      ...data,
      status
    }
  });

  revalidatePath('/inventory');
  return { success: true, id: product.id };
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete products." };
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return { error: "Product not found." };

    await prisma.product.delete({
      where: { id }
    });

    await logActivity(
      "Delete Product", 
      `Deleted Product ${product.code} - ${product.name}`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/inventory');
    return { success: true };
  } catch (e: any) {
    const msg = e.message || "";
    if (e.code === 'P2003' || msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return { error: "Cannot delete this product because it is referenced in past invoices or purchases." };
    }
    return { error: "Failed to delete. Please try again." };
  }
}

export async function updateProduct(id: string, data: {
  code: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  unit: string;
  price: number;
  purchasePrice: number;
}) {
  const result = productSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map(e => e.message).join(", "));
  }
  const status = data.stock > 10 ? 'In Stock' : data.stock > 0 ? 'Low Stock' : 'Out of Stock';
  
  await prisma.product.update({
    where: { id },
    data: {
      ...data,
      status
    }
  });

  revalidatePath('/inventory');
  return { success: true };
}

export async function bulkDeleteProducts(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete products." };
  }

  let successCount = 0;
  let failureCount = 0;

  for (const id of ids) {
    try {
      await prisma.product.delete({ where: { id } });
      successCount++;
    } catch (e: any) {
      failureCount++;
    }
  }

  if (successCount > 0) {
    await logActivity(
      "Bulk Delete", 
      `Bulk deleted ${successCount} products`, 
      session.user.name || "Unknown", 
      "OWNER"
    );
    revalidatePath('/inventory');
  }

  if (failureCount > 0) {
    if (successCount === 0) {
      return { error: "Cannot delete selected products because they are referenced in past invoices or purchases." };
    }
    return { error: `Deleted ${successCount} products, but ${failureCount} failed because they are referenced in past transactions.` };
  }

  return { success: true };
}
