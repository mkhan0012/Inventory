"use client";
import React, { useState, useMemo } from 'react';
import { FileText, Download, Trash2, Filter } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import { deleteInvoice, deleteDirectSale } from '@/actions/sales';
import * as XLSX from 'xlsx';

interface Sale {
  id: string;
  no: string;
  date: Date;
  customer: string;
  items: number;
  total: number;
  status: string;
  type: string;
}

interface SalesClientProps {
  sales: Sale[];
  isOwner: boolean;
}

export default function SalesClient({ sales, isOwner }: SalesClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      if (statusFilter !== 'All' && sale.status !== statusFilter) return false;
      return true;
    });
  }, [sales, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredSales.map(s => s.id)));
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

  const handleBulkExport = () => {
    const itemsToExport = sales.filter(s => selectedIds.has(s.id));
    const data = itemsToExport.map(s => ({
      "Invoice/Sale No": s.no,
      "Date": new Date(s.date).toLocaleDateString(),
      "Customer": s.customer,
      "Items": s.items,
      "Total Amount": s.total,
      "Status": s.status,
      "Type": s.type
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");
    XLSX.writeFile(workbook, `Sales_Export.xlsx`);
  };

  return (
    <>
      <div className="filters-bar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-main)', padding: '6px 12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
          <Filter size={14} color="var(--text-muted)" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            <option value="PAID">Paid</option>
            <option value="DUE">Due</option>
          </select>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'var(--primary)', padding: '6px 12px', borderRadius: '8px', color: 'white', alignItems: 'center', animation: 'fadeInUp 0.2s ease-out' }}>
          <span style={{ fontSize: '13px', fontWeight: 500, marginRight: '8px' }}>{selectedIds.size} Selected</span>
          <button onClick={handleBulkExport} style={{ background: 'white', color: 'var(--primary)', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download size={14} /> Export
          </button>
          {/* Note: Bulk delete is complex because of stock reversal. Left it out for now to ensure safety. */}
        </div>
      )}

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={filteredSales.length > 0 && selectedIds.size === filteredSales.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>No.</th>
              <th>Date</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="desktop-only text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Sales Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters or search terms.</span>
                  </div>
                </td>
              </tr>
            ) : filteredSales.map((sale) => (
              <tr key={sale.id} style={{ background: selectedIds.has(sale.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(sale.id)}
                    onChange={() => handleSelect(sale.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">
                  {sale.no}
                  {sale.type === 'DIRECT' && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '2px 6px', borderRadius: '10px' }}>QUICK</span>}
                </td>
                <td>{new Date(sale.date).toLocaleDateString()}</td>
                <td className="font-medium">{sale.customer}</td>
                <td>{sale.items} items</td>
                <td>₹{sale.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  <span className={`status-badge ${sale.status.toLowerCase()}`}>
                    {sale.status}
                  </span>
                </td>
                <td className="desktop-only">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
