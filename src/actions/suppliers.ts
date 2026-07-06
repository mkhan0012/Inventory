"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getSuppliers(search?: string) {
  const suppliers = await prisma.supplier.findMany({
    where: search ? {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' }
  });
  return suppliers.map(s => ({
    ...s,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString()
  }));
}

export async function createSupplier(data: {
  name: string;
  phone: string;
}) {
  const supplier = await prisma.supplier.create({
    data
  });
  revalidatePath('/suppliers');
  return { success: true, id: supplier.id };
}

export async function deleteSupplier(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete suppliers." };
  }

  try {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) return { error: "Supplier not found." };

    await prisma.supplier.delete({ where: { id } });

    await logActivity(
      "Delete Supplier", 
      `Deleted Supplier: ${supplier.name}`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/suppliers');
  } catch (e: any) {
    const msg = e.message || "";
    if (e.code === 'P2003' || msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return { error: "Cannot delete this supplier because they have past purchases or payments." };
    }
    return { error: "Failed to delete. Please try again." };
  }
}

export async function updateSupplier(id: string, data: { name: string; phone: string; }) {
  await prisma.supplier.update({
    where: { id },
    data
  });

  revalidatePath('/suppliers');
  return { success: true };
}

export async function bulkDeleteSuppliers(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete suppliers." };
  }

  try {
    const suppliers = await prisma.supplier.findMany({ where: { id: { in: ids } } });
    if (suppliers.length === 0) return { error: "No suppliers found." };

    await prisma.supplier.deleteMany({
      where: { id: { in: ids } }
    });

    await logActivity(
      "Bulk Delete", 
      `Bulk deleted ${suppliers.length} suppliers`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/suppliers');
    return { success: true };
  } catch (e: any) {
    const msg = e.message || "";
    if (e.code === 'P2003' || msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return { error: "Cannot delete some suppliers because they have past purchases or payments." };
    }
    return { error: "Failed to bulk delete. Please try again." };
  }
}
