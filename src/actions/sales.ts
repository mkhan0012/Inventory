"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getInvoices() {
  return await prisma.invoice.findMany({
    include: {
      customer: true,
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function createInvoice(data: {
  customerId: string;
  items: Array<{ productId: string; quantity: number; rate: number }>;
  tax: number;
  status: string;
  date?: string;
}) {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const total = subtotal + data.tax;

  const invoice = await prisma.$transaction(async (tx) => {
    // 1. Update stock
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product || product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ID ${item.productId}`);
      }
      const newStock = product.stock - item.quantity;
      const status = newStock > 10 ? 'In Stock' : newStock > 0 ? 'Low Stock' : 'Out of Stock';
      
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: newStock, status }
      });
    }

    // 2. Create Invoice
    const newInvoice = await tx.invoice.create({
      data: {
        invoiceNo: `INV-${Date.now().toString().substring(7)}`,
        date: data.date ? new Date(data.date) : undefined,
        customerId: data.customerId,
        subtotal,
        tax: data.tax,
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

    // 3. Update Customer & Check Credit Limit
    const dueAmountIncrement = data.status === 'DUE' ? total : 0;
    
    const customer = await tx.customer.findUnique({ where: { id: data.customerId } });
    if (!customer) throw new Error("Customer not found.");

    if (data.status === 'DUE' && (customer.dueAmount + total > customer.creditLimit)) {
      throw new Error(`Credit Limit Exceeded! Customer's limit is ₹${customer.creditLimit}, but their total due would be ₹${customer.dueAmount + total}`);
    }
    
    await tx.customer.update({
      where: { id: data.customerId },
      data: {
        totalPurchases: { increment: total },
        dueAmount: { increment: dueAmountIncrement }
      }
    });

    return newInvoice;
  });

  const session = await getServerSession(authOptions);
  if (session?.user) {
    await logActivity(
      "Create Invoice", 
      `Created Invoice ${invoice.invoiceNo} for ₹${invoice.total}`, 
      session.user.name || "Unknown", 
      (session.user as any).role || "STAFF"
    );
  }

  revalidatePath('/sales');
  revalidatePath('/inventory');
  revalidatePath('/customers');
  revalidatePath('/');
  return invoice;
}

export async function getUpsellSuggestions(productIds: string[]) {
  if (productIds.length === 0) return [];
  
  const relatedInvoices = await prisma.invoiceItem.findMany({
    where: { productId: { in: productIds } },
    select: { invoiceId: true },
    distinct: ['invoiceId']
  });
  
  const invoiceIds = relatedInvoices.map(i => i.invoiceId);
  if (invoiceIds.length === 0) return [];

  const otherItems = await prisma.invoiceItem.findMany({
    where: {
      invoiceId: { in: invoiceIds },
      productId: { notIn: productIds }
    },
    include: { product: true }
  });

  const freqMap = new Map<string, { product: any, count: number }>();
  for (const item of otherItems) {
    if (!freqMap.has(item.productId)) {
      freqMap.set(item.productId, { product: item.product, count: 0 });
    }
    freqMap.get(item.productId)!.count += 1;
  }

  return Array.from(freqMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 3)
    .map(entry => entry.product);
}

export async function deleteInvoice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    throw new Error("Unauthorized: Only owners can delete invoices.");
  }
  const userName = session.user.name || "Unknown";

  try {
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id }, include: { items: true } });
      if (!invoice) throw new Error("Invoice not found.");

      // Reverse Customer amounts
      await tx.customer.update({
        where: { id: invoice.customerId },
        data: {
          totalPurchases: { decrement: invoice.total },
          dueAmount: { decrement: invoice.status === 'DUE' ? invoice.total : 0 }
        }
      });

      // Reverse Product stock
      await Promise.all(invoice.items.map(item => 
        tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } }
        })
      ));

      // Delete Invoice
      await tx.invoice.delete({ where: { id } });

      await logActivity(
        "Delete Invoice", 
        `Deleted Invoice ${invoice.invoiceNo} (₹${invoice.total})`, 
        userName, 
        "OWNER"
      );
    }, { maxWait: 15000, timeout: 15000 });

    revalidatePath('/sales');
    revalidatePath('/inventory');
    revalidatePath('/customers');
  } catch (error) {
    console.error("Error deleting invoice:", error);
    throw error;
  }
}
