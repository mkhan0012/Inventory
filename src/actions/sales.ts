"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { logActivity } from "./activity";

export async function getInvoices(search?: string) {
  return await prisma.invoice.findMany({
    where: search ? {
      OR: [
        { invoiceNo: { contains: search } },
        { customer: { name: { contains: search } } }
      ]
    } : undefined,
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
    const productCache = new Map<string, number>();

    // 1. Update stock
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, purchasePrice: true, name: true } });
      if (!product) throw new Error(`Product not found.`);
      productCache.set(product.id, product.purchasePrice);
      
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });

      if (updatedProduct.stock < 0) {
        throw new Error(`Insufficient stock for ${updatedProduct.name}`);
      }

      const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
      
      await tx.product.update({
        where: { id: item.productId },
        data: { status }
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
            purchaseRate: productCache.get(item.productId) || 0,
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
  return { success: true, id: invoice.id };
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
    .map(entry => ({
      ...entry.product,
      createdAt: entry.product.createdAt.toISOString(),
      updatedAt: entry.product.updatedAt.toISOString()
    }));
}

export async function deleteInvoice(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete invoices." };
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

      // Reverse Product stock and update status
      for (const item of invoice.items) {
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
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}

export async function getDirectSales(search?: string) {
  const directSales = await prisma.directSale.findMany({
    where: search ? {
      saleNo: { contains: search }
    } : undefined,
    include: {
      items: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return directSales.map(ds => ({
    ...ds,
    date: ds.date.toISOString(),
    createdAt: ds.createdAt.toISOString()
  }));
}

export async function createDirectSale(data: {
  items: Array<{ productId: string; quantity: number; rate: number }>;
  tax: number;
  date?: string;
}) {
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const total = subtotal + data.tax;

  const directSale = await prisma.$transaction(async (tx) => {
    const productCache = new Map<string, number>();

    // 1. Update stock
    for (const item of data.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId }, select: { id: true, purchasePrice: true, name: true } });
      if (!product) throw new Error(`Product not found.`);
      productCache.set(product.id, product.purchasePrice);
      
      const updatedProduct = await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });

      if (updatedProduct.stock < 0) {
        throw new Error(`Insufficient stock for ${updatedProduct.name}`);
      }

      const status = updatedProduct.stock > 10 ? 'In Stock' : updatedProduct.stock > 0 ? 'Low Stock' : 'Out of Stock';
      
      await tx.product.update({
        where: { id: item.productId },
        data: { status }
      });
    }

    // 2. Create Direct Sale
    const newDirectSale = await tx.directSale.create({
      data: {
        saleNo: `DS-${Date.now().toString().substring(7)}`,
        date: data.date ? new Date(data.date) : undefined,
        subtotal,
        tax: data.tax,
        total,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            rate: item.rate,
            purchaseRate: productCache.get(item.productId) || 0,
            amount: item.quantity * item.rate
          }))
        }
      }
    });

    return newDirectSale;
  });

  const session = await getServerSession(authOptions);
  if (session?.user) {
    await logActivity(
      "Create Direct Sale", 
      `Created Direct Sale ${directSale.saleNo} for ₹${directSale.total}`, 
      session.user.name || "Unknown", 
      (session.user as any).role || "STAFF"
    );
  }

  revalidatePath('/sales');
  revalidatePath('/inventory');
  revalidatePath('/');
  return { success: true, id: directSale.id };
}

export async function deleteDirectSale(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "OWNER") {
    return { error: "Unauthorized: Only owners can delete sales." };
  }
  const userName = session.user.name || "Unknown";

  try {
    await prisma.$transaction(async (tx) => {
      const directSale = await tx.directSale.findUnique({ where: { id }, include: { items: true } });
      if (!directSale) throw new Error("Sale not found.");

      // Reverse Product stock and update status
      for (const item of directSale.items) {
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

      // Delete Sale
      await tx.directSale.delete({ where: { id } });

      await logActivity(
        "Delete Direct Sale", 
        `Deleted Direct Sale ${directSale.saleNo} (₹${directSale.total})`, 
        userName, 
        "OWNER"
      );
    }, { maxWait: 15000, timeout: 15000 });

    revalidatePath('/sales');
    revalidatePath('/inventory');
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}

export async function markInvoiceAsPaid(id: string) {
  const session = await getServerSession(authOptions);
  const userName = session?.user?.name || "Unknown";
  const userRole = (session?.user as any)?.role || "STAFF";

  try {
    await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({ where: { id } });
      if (!invoice) throw new Error("Invoice not found.");
      if (invoice.status === 'PAID') throw new Error("Invoice is already paid.");

      await tx.invoice.update({
        where: { id },
        data: { status: 'PAID' }
      });

      await tx.customer.update({
        where: { id: invoice.customerId },
        data: {
          dueAmount: { decrement: invoice.total }
        }
      });

      await logActivity(
        "Mark Invoice Paid",
        `Marked Invoice ${invoice.invoiceNo} as Paid (₹${invoice.total})`,
        userName,
        userRole
      );
    });

    revalidatePath('/sales');
    revalidatePath('/customers');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { error: e.message || "An unexpected error occurred." };
  }
}
