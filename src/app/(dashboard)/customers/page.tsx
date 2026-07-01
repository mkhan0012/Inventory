import React from 'react';
import { Search } from 'lucide-react';
import '../inventory/page.css';
import { getCustomers, deleteCustomer } from '@/actions/customers';
import AddCustomerModal from '@/components/AddCustomerModal';
import DeleteButton from '@/components/DeleteButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function CustomersPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  const customers = await getCustomers();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search customers..." />
          </div>
          <div className="desktop-only">
            <AddCustomerModal />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Purchases</th>
              <th>Due Amount</th>
              {isOwner && <th className="desktop-only">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No customers found.</td>
              </tr>
            ) : customers.map((customer) => (
              <tr key={customer.id}>
                <td className="text-primary font-medium">{customer.id.substring(customer.id.length - 6).toUpperCase()}</td>
                <td className="font-medium">{customer.name}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>₹{customer.totalPurchases.toFixed(2)}</td>
                <td>
                  <span style={{ color: customer.dueAmount > 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 500 }}>
                    ₹{customer.dueAmount.toFixed(2)}
                  </span>
                </td>
                {isOwner && (
                  <td className="desktop-only">
                    <DeleteButton id={customer.id} action={deleteCustomer} itemType="customer" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
