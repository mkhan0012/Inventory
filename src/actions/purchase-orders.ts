"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getPurchaseOrders(search?: string) {
  return await prisma.purchaseOrder.findMany({
    where: {
      isDeleted: false,
      ...(search ? {
        OR: [
          { poNumber: { contains: search } },
          { supplier: { name: { contains: search } } }
        ]
      } : {})
    },
    include: {
      supplier: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createPurchaseOrder(data: {
  supplierId: string;
  items: Array<{ productId: string; quantity: number; rate: number }>;
  date?: string;
}) {
  try {
    const total = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

    const po = await prisma.$transaction(async (tx) => {
      const newPo = await tx.purchaseOrder.create({
        data: {
          poNumber: `PO-${Date.now().toString().substring(7)}`,
          date: data.date ? new Date(data.date) : undefined,
          supplierId: data.supplierId,
          total,
          status: 'PENDING',
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
      return newPo;
    });

    const session = await getServerSession(authOptions);
    if (session?.user) {
      await logActivity(
        "Create Purchase Order", 
        `Created PO ${po.poNumber} for ₹${po.total}`, 
        session.user.name || "Unknown", 
        (session.user as any).role || "STAFF"
      );
    }

    revalidatePath('/purchase-orders');
    return { success: true, id: po.id };
  } catch (e: any) {
    return { error: e.message || "Failed to create Purchase Order." };
  }
}

export async function updatePurchaseOrderStatus(id: string, status: string) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Unknown";
  
  try {
    await prisma.purchaseOrder.update({
      where: { id },
      data: { status }
    });

    await logActivity(
      "Update PO Status",
      `Marked PO as ${status}`,
      userName,
      (session?.user as any)?.role || "STAFF"
    );

    revalidatePath('/purchase-orders');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}

export async function deletePurchaseOrder(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete POs." };
  }
  const userName = session.user.name || "Unknown";

  try {
    const po = await prisma.purchaseOrder.findUnique({ where: { id } });
    if (!po) throw new Error("PO not found.");

    await prisma.purchaseOrder.update({ 
      where: { id },
      data: { isDeleted: true }
    });

    await logActivity(
      "Delete PO", 
      `Deleted PO ${po.poNumber}`, 
      userName, 
      "OWNER"
    );

    revalidatePath('/purchase-orders');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}
