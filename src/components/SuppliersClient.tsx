"use client";
import React, { useState } from 'react';
import { Truck, Download, Trash2, Edit2 } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import EditSupplierModal from '@/components/EditSupplierModal';
import { bulkDeleteSuppliers, deleteSupplier } from '@/actions/suppliers';
import * as XLSX from 'xlsx';

interface Supplier {
  id: string;
  name: string;
  phone: string | null;
  totalSupplied: number;
  dueAmount: number;
}

interface SuppliersClientProps {
  suppliers: Supplier[];
  isOwner: boolean;
}

export default function SuppliersClient({ suppliers, isOwner }: SuppliersClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(suppliers.map(s => s.id)));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} suppliers?`)) return;
    setIsDeleting(true);
    const result = await bulkDeleteSuppliers(Array.from(selectedIds));
    if (result.error) {
      alert(result.error);
    } else {
      setSelectedIds(new Set());
    }
    setIsDeleting(false);
  };

  const handleBulkExport = () => {
    const itemsToExport = suppliers.filter(s => selectedIds.has(s.id));
    const data = itemsToExport.map(s => ({
      "Supplier ID": s.id.substring(s.id.length - 6).toUpperCase(),
      "Name": s.name,
      "Phone": s.phone || 'N/A',
      "Total Supplied": s.totalSupplied,
      "Due Amount": s.dueAmount
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
    XLSX.writeFile(workbook, `Suppliers_Export.xlsx`);
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
                  checked={suppliers.length > 0 && selectedIds.size === suppliers.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>Supplier ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Total Supplied</th>
              <th>Due Amount</th>
              {isOwner && <th className="desktop-only text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {suppliers.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Truck size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Suppliers Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search or add a new supplier.</span>
                  </div>
                </td>
              </tr>
            ) : suppliers.map((supplier) => (
              <tr key={supplier.id} style={{ background: selectedIds.has(supplier.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(supplier.id)}
                    onChange={() => handleSelect(supplier.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">{supplier.id.substring(supplier.id.length - 6).toUpperCase()}</td>
                <td className="font-medium">{supplier.name}</td>
                <td>{supplier.phone || 'N/A'}</td>
                <td>₹{supplier.totalSupplied.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  <span style={{ color: supplier.dueAmount > 0 ? 'var(--danger)' : 'var(--text-main)', fontWeight: 500 }}>
                    ₹{supplier.dueAmount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                  </span>
                </td>
                {isOwner && (
                  <td className="desktop-only">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        onClick={() => setEditingSupplier(supplier)}
                        title="Edit Supplier"
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
                      <DeleteButton id={supplier.id} action={deleteSupplier} itemType="supplier" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingSupplier && (
        <EditSupplierModal 
          supplier={editingSupplier} 
          isOpen={true} 
          onClose={() => setEditingSupplier(null)} 
        />
      )}
    </>
  );
}
