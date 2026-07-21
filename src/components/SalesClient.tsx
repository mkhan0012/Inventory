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
                <td colSpan={8} style={{ padding: '80px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', animation: 'fadeInUp 0.6s ease-out' }}>
                    <div style={{ position: 'relative', width: '120px', height: '120px', marginBottom: '24px' }}>
                      {/* Decorative background blobs */}
                      <div style={{ position: 'absolute', top: '10%', left: '10%', width: '80%', height: '80%', background: 'var(--primary-glow)', filter: 'blur(20px)', borderRadius: '50%', opacity: 0.6 }}></div>
                      
                      {/* Custom premium SVG illustration */}
                      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'relative', zIndex: 1 }}>
                        <rect x="35" y="25" width="50" height="70" rx="8" fill="var(--bg-card)" stroke="var(--border)" strokeWidth="2" />
                        <rect x="45" y="40" width="30" height="4" rx="2" fill="var(--primary)" opacity="0.8" />
                        <rect x="45" y="52" width="20" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
                        <rect x="45" y="64" width="25" height="4" rx="2" fill="var(--text-muted)" opacity="0.4" />
                        <path d="M45 78 L55 78 M65 78 L75 78" stroke="var(--text-muted)" strokeWidth="4" strokeLinecap="round" opacity="0.4" />
                        
                        {/* Floating elements */}
                        <circle cx="85" cy="40" r="8" fill="var(--success)" fillOpacity="0.2" stroke="var(--success)" strokeWidth="1.5" />
                        <rect x="25" y="70" width="12" height="12" rx="3" fill="var(--warning)" fillOpacity="0.2" stroke="var(--warning)" strokeWidth="1.5" transform="rotate(-15 25 70)" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px', letterSpacing: '-0.5px' }}>No Sales Found</span>
                    <span style={{ fontSize: '14px', maxWidth: '260px', lineHeight: '1.5' }}>Looks like there are no sales matching your criteria right now.</span>
                    
                    <Link href="/sales/new" style={{ marginTop: '24px', padding: '10px 20px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px var(--primary-glow)', transition: 'all 0.3s ease' }} className="active-scale">
                      Create New Sale
                    </Link>
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
