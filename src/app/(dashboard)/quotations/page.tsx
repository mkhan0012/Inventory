import React from 'react';
import { Search, Printer } from 'lucide-react';
import '../inventory/page.css';
import { getQuotations } from '@/actions/quotations';
import CreateQuotationModal from '@/components/CreateQuotationModal';
import { getCustomers } from '@/actions/customers';
import { getProducts } from '@/actions/inventory';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function QuotationsPage() {
  const quotations = await getQuotations();
  const customers = await getCustomers();
  const products = await getProducts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Quotations / Estimates</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search estimates..." />
          </div>
          <CreateQuotationModal customers={customers} products={products} />
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Estimate No</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {quotations.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No quotations found.</td>
              </tr>
            ) : quotations.map((quote) => (
              <tr key={quote.id}>
                <td className="text-primary font-medium">{quote.quoteNo}</td>
                <td>{new Date(quote.date).toLocaleDateString()}</td>
                <td className="font-medium">{quote.customer.name}</td>
                <td>{quote.items.length} items</td>
                <td>₹{quote.total.toFixed(2)}</td>
                <td>
                  <Link href={`/quotations/${quote.id}/print`} className="btn-icon" title="Print Estimate" target="_blank">
                    <Printer size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
