"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getExpenses() {
  return await prisma.expense.findMany({
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
  return expense;
}
