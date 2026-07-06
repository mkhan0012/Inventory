"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getCustomers(search?: string) {
  const customers = await prisma.customer.findMany({
    where: search ? {
      OR: [
        { name: { contains: search } },
        { phone: { contains: search } }
      ]
    } : undefined,
    orderBy: { createdAt: 'desc' }
  });
  return customers.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString()
  }));
}

import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits")
});

export async function createCustomer(data: {
  name: string;
  phone: string;
}) {
  const result = customerSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map(e => e.message).join(", "));
  }
  const customer = await prisma.customer.create({
    data: {
      ...data,
      totalPurchases: 0,
      dueAmount: 0
    }
  });

  revalidatePath('/customers');
  return { success: true, id: customer.id };
}

export async function deleteCustomer(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete customers." };
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) return { error: "Customer not found." };

    await prisma.customer.delete({ where: { id } });

    await logActivity(
      "Delete Customer", 
      `Deleted Customer: ${customer.name}`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/customers');
  } catch (e: any) {
    const msg = e.message || "";
    if (e.code === 'P2003' || msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return { error: "Cannot delete this customer because they have past invoices or payments." };
    }
    return { error: "Failed to delete. Please try again." };
  }
}

export async function updateCustomer(id: string, data: { name: string; phone: string; }) {
  const result = customerSchema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.issues.map(e => e.message).join(", "));
  }
  
  await prisma.customer.update({
    where: { id },
    data
  });

  revalidatePath('/customers');
  return { success: true };
}

export async function bulkDeleteCustomers(ids: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete customers." };
  }

  try {
    const customers = await prisma.customer.findMany({ where: { id: { in: ids } } });
    if (customers.length === 0) return { error: "No customers found." };

    await prisma.customer.deleteMany({
      where: { id: { in: ids } }
    });

    await logActivity(
      "Bulk Delete", 
      `Bulk deleted ${customers.length} customers`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/customers');
    return { success: true };
  } catch (e: any) {
    const msg = e.message || "";
    if (e.code === 'P2003' || msg.includes('foreign key constraint') || msg.includes('violates RESTRICT')) {
      return { error: "Cannot delete some customers because they have past invoices or payments." };
    }
    return { error: "Failed to bulk delete. Please try again." };
  }
}
