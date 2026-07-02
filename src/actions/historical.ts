"use server";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addHistoricalRecord(data: {
  date: string;
  sales: number;
  profit: number;
  purchases: number;
  notes?: string;
}) {
  try {
    await prisma.historicalRecord.create({
      data: {
        date: new Date(data.date),
        sales: data.sales,
        profit: data.profit,
        purchases: data.purchases,
        notes: data.notes
      }
    });

    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function deleteHistoricalRecord(id: string) {
  try {
    await prisma.historicalRecord.delete({
      where: { id }
    });
    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function getHistoricalRecords() {
  return await prisma.historicalRecord.findMany({
    orderBy: { date: 'desc' }
  });
}
