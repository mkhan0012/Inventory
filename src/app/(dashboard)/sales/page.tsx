import React from 'react';
import '../inventory/page.css';
import { getInvoices, getDirectSales } from '@/actions/sales';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import CreateDirectSaleModal from '@/components/CreateDirectSaleModal';
import SearchBar from '@/components/SearchBar';
import SalesClient from '@/components/SalesClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getCustomers } from '@/actions/customers';
import { getProducts } from '@/actions/inventory';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SalesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const invoices = await getInvoices(sp?.search);
  const directSales = await getDirectSales(sp?.search);
  const customers = await getCustomers();
  const products = await getProducts();

  const combinedSales = [
    ...invoices.map(i => ({
      id: i.id,
      no: i.invoiceNo,
      date: new Date(i.date),
      customer: i.customer.name,
      items: i.items.length,
      total: i.total,
      status: i.status,
      type: 'INVOICE'
    })),
    ...directSales.map(d => ({
      id: d.id,
      no: d.saleNo,
      date: new Date(d.date),
      customer: 'Direct / Walk-in',
      items: d.items.length,
      total: d.total,
      status: 'PAID',
      type: 'DIRECT'
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sales & Invoices</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search invoices..." basePath="/sales" />
          <div className="desktop-only" style={{ display: 'flex', gap: '10px' }}>
            <CreateDirectSaleModal products={products} />
            <CreateInvoiceModal customers={customers} products={products} />
          </div>
        </div>
      </div>

      <SalesClient sales={combinedSales} isOwner={isOwner} />
    </div>
  );
}
