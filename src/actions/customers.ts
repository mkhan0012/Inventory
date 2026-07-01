"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getCustomers() {
  return await prisma.customer.findMany({
    orderBy: { createdAt: 'desc' }
  });
}

export async function createCustomer(data: {
  name: string;
  phone: string;
}) {
  const customer = await prisma.customer.create({
    data: {
      ...data,
      totalPurchases: 0,
      dueAmount: 0
    }
  });

  revalidatePath('/customers');
  return customer;
}

export async function deleteCustomer(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    throw new Error("Unauthorized: Only owners can delete customers.");
  }

  try {
    const customer = await prisma.customer.findUnique({ where: { id } });
    if (!customer) throw new Error("Customer not found.");

    await prisma.customer.delete({ where: { id } });

    await logActivity(
      "Delete Customer", 
      `Deleted Customer: ${customer.name}`, 
      session.user.name || "Unknown", 
      "OWNER"
    );

    revalidatePath('/customers');
  } catch (e: any) {
    if (e.code === 'P2003') {
      throw new Error("Cannot delete this customer because they have past invoices or payments.");
    }
    throw e;
  }
}
