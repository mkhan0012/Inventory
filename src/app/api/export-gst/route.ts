import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  // Get current month dates
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const invoices = await prisma.invoice.findMany({
    where: { date: { gte: startOfMonth } },
    include: { customer: true },
    orderBy: { date: 'asc' }
  });

  const exportData = invoices.map(inv => ({
    "Date": new Date(inv.date).toLocaleDateString(),
    "Invoice No": inv.invoiceNo,
    "Customer Name": inv.customer.name,
    "Subtotal": inv.subtotal,
    "Tax Amount (GST)": inv.tax,
    "Total Amount": inv.total,
    "Status": inv.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "GST Report");

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buffer, {
    headers: {
      'Content-Disposition': `attachment; filename="GST_Report_${startOfMonth.toLocaleString('default', { month: 'short' })}_${startOfMonth.getFullYear()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    }
  });
}
