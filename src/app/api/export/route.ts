import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import * as XLSX from 'xlsx';

export async function GET() {
  const sales = await prisma.invoice.findMany({ include: { customer: true } });
  const purchases = await prisma.purchase.findMany({ include: { supplier: true } });
  const expenses = await prisma.expense.findMany();

  const wb = XLSX.utils.book_new();

  const salesData = sales.map(s => ({
    'Invoice No': s.invoiceNo,
    'Date': new Date(s.date).toLocaleDateString(),
    'Customer': s.customer.name,
    'Status': s.status,
    'Total (INR)': s.total
  }));
  const wsSales = XLSX.utils.json_to_sheet(salesData);
  XLSX.utils.book_append_sheet(wb, wsSales, "Sales");

  const purchasesData = purchases.map(p => ({
    'Purchase No': p.purchaseNo,
    'Date': new Date(p.date).toLocaleDateString(),
    'Supplier': p.supplier.name,
    'Status': p.status,
    'Total (INR)': p.total
  }));
  const wsPurchases = XLSX.utils.json_to_sheet(purchasesData);
  XLSX.utils.book_append_sheet(wb, wsPurchases, "Purchases");

  const expensesData = expenses.map(e => ({
    'Date': new Date(e.date).toLocaleDateString(),
    'Category': e.category,
    'Description': e.description,
    'Amount (INR)': e.amount
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, wsExpenses, "Expenses");

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new NextResponse(buf, {
    status: 200,
    headers: {
      'Content-Disposition': `attachment; filename="Financial_Report_${new Date().getTime()}.xlsx"`,
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
  });
}
