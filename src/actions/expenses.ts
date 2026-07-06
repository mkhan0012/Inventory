"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExpenses(search?: string) {
  return await prisma.expense.findMany({
    where: search ? {
      OR: [
        { description: { contains: search } },
        { category: { contains: search } }
      ]
    } : undefined,
    orderBy: { date: 'desc' }
  });
}

export async function createExpense(data: {
  description: string;
  amount: number;
  category: string;
  date?: string;
}) {
  const expense = await prisma.expense.create({
    data: {
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date ? new Date(data.date) : undefined
    }
  });
  revalidatePath('/expenses');
  revalidatePath('/');
  return { success: true, id: expense.id };
}

export async function updateExpense(id: string, data: { description: string; amount: number; category: string; date?: string; }) {
  await prisma.expense.update({
    where: { id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined
    }
  });
  revalidatePath('/expenses');
  revalidatePath('/');
  return { success: true };
}

export async function deleteExpense(id: string) {
  try {
    await prisma.expense.delete({ where: { id } });
    revalidatePath('/expenses');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to delete expense." };
  }
}

export async function bulkDeleteExpenses(ids: string[]) {
  try {
    await prisma.expense.deleteMany({ where: { id: { in: ids } } });
    revalidatePath('/expenses');
    revalidatePath('/');
    return { success: true };
  } catch (e: any) {
    return { error: "Failed to bulk delete expenses." };
  }
}
