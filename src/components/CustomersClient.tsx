"use client";
import React, { useState } from 'react';
import { Users, Download, Trash2, Edit2 } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import EditCustomerModal from '@/components/EditCustomerModal';
import { bulkDeleteCustomers, deleteCustomer } from '@/actions/customers';
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  name: string;
  phone: string;
  totalPurchases: number;
  dueAmount: number;
}

interface CustomersClientProps {
  customers: Customer[];
  isOwner: boolean;
}

export default function CustomersClient({ customers, isOwner }: CustomersClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(customers.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} customers?`)) return;
    setIsDeleting(true);
    const result = await bulkDeleteCustomers(Array.from(selectedIds));
    if (result.error) {
      alert(result.error);
    } else {
      setSelectedIds(new Set());
    }
    setIsDeleting(false);
  };

  const handleBulkExport = () => {
    const itemsToExport = customers.filter(c => selectedIds.has(c.id));
    const data = itemsToExport.map(c => ({
      "Customer ID": c.id.substring(c.id.length - 6).toUpperCase(),
      "Name": c.name,
      "Phone": c.phone || 'N/A',
      "Total Purchases": c.totalPurchases,
      "Due Amount": c.dueAmount
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
    XLSX.writeFile(workbook, `Customers_Export.xlsx`);
  };

  return (
    <>
      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', color: 'white', alignItems: 'center', animation: 'fadeInUp 0.2s ease-out' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, marginRight: '8px' }}>{selectedIds.size} Selected</span>
          <button onClick={handleBulkExport} style={{ background: 'white', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={14} /> Export
          </button>
          {isOwner && (
            <button onClick={handleBulkDelete} disabled={isDeleting} style={{ background: 'var(--danger)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Trash2 size={14} /> {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          )}
        </div>
      )}

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={customers.length > 0 && selectedIds.size === customers.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Purchases</th>
              <th>Due Amount</th>
              {isOwner && <th className="desktop-only text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Users size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Customers Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search or add a new customer.</span>
                  </div>
                </td>
              </tr>
            ) : customers.map((customer) => (
              <tr key={customer.id} style={{ background: selectedIds.has(customer.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(customer.id)}
                    onChange={() => handleSelect(customer.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">{customer.id.substring(customer.id.length - 6).toUpperCase()}</td>
                <td className="font-medium">{customer.name}</td>
                <td>{customer.phone || 'N/A'}</td>
                <td>₹{customer.totalPurchases.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  <span style={{ color: customer.dueAmount > 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 500 }}>
                    ₹{customer.dueAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </td>
                {isOwner && (
                  <td className="desktop-only">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        onClick={() => setEditingCustomer(customer)}
                        title="Edit Customer"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--primary)',
                          cursor: 'pointer',
                          padding: '4px',
                        }}
                      >
                        <Edit2 size={16} />
                      </button>
                      <DeleteButton id={customer.id} action={deleteCustomer} itemType="customer" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingCustomer && (
        <EditCustomerModal 
          customer={editingCustomer} 
          isOpen={true} 
          onClose={() => setEditingCustomer(null)} 
        />
      )}
    </>
  );
}
