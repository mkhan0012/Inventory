import React from 'react';
import { Search } from 'lucide-react';
import '../inventory/page.css';
import { getSuppliers, deleteSupplier } from '@/actions/suppliers';
import AddSupplierModal from '@/components/AddSupplierModal';
import DeleteButton from '@/components/DeleteButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function SuppliersPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const suppliers = await getSuppliers();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search suppliers..." />
          </div>
          <div className="desktop-only">
            <AddSupplierModal />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Supplied</th>
              <th>Due Amount</th>
              {isOwner && <th className="desktop-only">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No suppliers found.</td>
              </tr>
            ) : suppliers.map((supplier) => (
              <tr key={supplier.id}>
                <td className="text-primary font-medium">{supplier.id.substring(supplier.id.length - 6).toUpperCase()}</td>
                <td className="font-medium">{supplier.name}</td>
                <td>{supplier.phone || 'N/A'}</td>
                <td>₹{supplier.totalSupplied.toFixed(2)}</td>
                <td>
                  <span style={{ color: supplier.dueAmount > 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 500 }}>
                    ₹{supplier.dueAmount.toFixed(2)}
                  </span>
                </td>
                {isOwner && (
                  <td className="desktop-only">
                    <DeleteButton id={supplier.id} action={deleteSupplier} itemType="supplier" />
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
