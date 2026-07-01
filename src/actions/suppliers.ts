"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getSuppliers() {
  return await prisma.supplier.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createSupplier(data: {
  name: string;
  phone: string;
}) {
  const supplier = await prisma.supplier.create({
    data
  });
  revalidatePath('/suppliers');
  return supplier;
}

export async function deleteSupplier(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    throw new Error("Unauthorized: Only owners can delete suppliers.");
  }

  try {
    const supplier = await prisma.supplier.findUnique({ where: { id } });
    if (!supplier) throw new Error("Supplier not found.");

    await prisma.supplier.delete({ where: { id } });

    await logActivity(
      "Delete Supplier", 
      `Deleted Supplier: ${supplier.name}`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/suppliers');
  } catch (e: any) {
    if (e.code === 'P2003') {
      throw new Error("Cannot delete this supplier because they have past purchases or payments.");
    }
    throw e;
  }
}
