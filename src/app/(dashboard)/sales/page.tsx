import React from 'react';
import { Search, FileText } from 'lucide-react';
import '../inventory/page.css';
import { getInvoices, deleteInvoice } from '@/actions/sales';
import CreateInvoiceModal from '@/components/CreateInvoiceModal';
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
  const customers = await getCustomers();
  const products = await getProducts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Sales & Invoices</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search invoices..." />
          </div>
          <div className="desktop-only">
            <CreateInvoiceModal customers={customers} products={products} />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Invoice No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="desktop-only">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No invoices found.</td>
              </tr>
            ) : invoices.map((invoice) => (
              <tr key={invoice.id}>
                <td className="text-primary font-medium">{invoice.invoiceNo}</td>
                <td>{new Date(invoice.date).toLocaleDateString()}</td>
                <td className="font-medium">{invoice.customer.name}</td>
                <td>{invoice.items.length} items</td>
                <td>₹{invoice.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${invoice.status.toLowerCase()}`}>
                    {invoice.status}
                  </span>
                </td>
                <td className="desktop-only" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Link href={`/sales/${invoice.id}/print`} className="btn-icon" target="_blank" title="Print Invoice">
                    <FileText size={16} />
                  </Link>
                  {isOwner && (
                    <DeleteButton id={invoice.id} action={deleteInvoice} itemType="invoice" />
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
