import React from 'react';
import { Search } from 'lucide-react';
import '../inventory/page.css';
import { getPayments } from '@/actions/payments';
import RecordPaymentModal from '@/components/RecordPaymentModal';
import { getCustomers } from '@/actions/customers';
import { getSuppliers } from '@/actions/suppliers';

export const dynamic = 'force-dynamic';

export default async function PaymentsPage() {
  const payments = await getPayments();
  const customers = await getCustomers();
  const suppliers = await getSuppliers();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Payments & Ledger</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search payments..." />
          </div>
          <RecordPaymentModal customers={customers} suppliers={suppliers} />
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Party (Customer/Supplier)</th>
              <th>Method</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No payments recorded yet.</td>
              </tr>
            ) : payments.map((payment) => (
              <tr key={payment.id}>
                <td>{new Date(payment.date).toLocaleDateString()}</td>
                <td>
                  <span className={`status-badge ${payment.type === 'INCOMING' ? 'in-stock' : 'low-stock'}`}>
                    {payment.type}
                  </span>
                </td>
                <td className="font-medium">
                  {payment.type === 'INCOMING' ? payment.customer?.name : payment.supplier?.name}
                </td>
                <td>{payment.method}</td>
                <td className="text-primary font-medium">₹{payment.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
