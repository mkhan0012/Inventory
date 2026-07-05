import React from 'react';
import { Search, FileText } from 'lucide-react';
import '../inventory/page.css';
import { getInvoices, deleteInvoice, getDirectSales, deleteDirectSale } from '@/actions/sales';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
import CreateDirectSaleModal from '@/components/CreateDirectSaleModal';
import DeleteButton from '@/components/DeleteButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getCustomers } from '@/actions/customers';
import { getProducts } from '@/actions/inventory';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SalesPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const invoices = await getInvoices();
  const directSales = await getDirectSales();
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
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search invoices..." />
          </div>
          <div className="desktop-only" style={{ display: 'flex', gap: '10px' }}>
            <CreateDirectSaleModal products={products} />
            <CreateInvoiceModal customers={customers} products={products} />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="desktop-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {combinedSales.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No sales records found.</td>
              </tr>
            ) : combinedSales.map((sale) => (
              <tr key={sale.id}>
                <td className="text-primary font-medium">
                  {sale.no}
                  {sale.type === 'DIRECT' && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '10px' }}>QUICK</span>}
                </td>
                <td>{sale.date.toLocaleDateString()}</td>
                <td className="font-medium">{sale.customer}</td>
                <td>{sale.items} items</td>
                <td>₹{sale.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${sale.status.toLowerCase()}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="desktop-only" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {sale.type === 'INVOICE' && (
                    <Link href={`/sales/${sale.id}/print`} className="btn-icon" target="_blank" title="Print Invoice">
                      <FileText size={16} />
                    </Link>
                  )}
                  {isOwner && (
                    sale.type === 'INVOICE' 
                      ? <DeleteButton id={sale.id} action={deleteInvoice} itemType="invoice" />
                      : <DeleteButton id={sale.id} action={deleteDirectSale} itemType="sale" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
