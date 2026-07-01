"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

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

  const soldMap = new Map<string, number>();
  recentInvoiceItems.forEach(item => {
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
      velocityPerDay,
      daysUntilEmpty
    };
  });
}

export async function createProduct(data: {
  code: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  unit: string;
  price: number;
}) {
  const status = data.stock > 10 ? 'In Stock' : data.stock > 0 ? 'Low Stock' : 'Out of Stock';
  
  const product = await prisma.product.create({
    data: {
      ...data,
      status
    }
  });

  revalidatePath('/inventory');
  return product;
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    throw new Error("Unauthorized: Only owners can delete products.");
  }

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new Error("Product not found.");

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
  } catch (e: any) {
    if (e.code === 'P2003') {
      throw new Error("Cannot delete this product because it is referenced in past invoices or purchases.");
    }
    throw e;
  }
}
