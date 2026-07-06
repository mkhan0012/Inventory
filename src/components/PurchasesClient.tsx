"use client";
import React, { useState, useMemo } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import { deletePurchase } from '@/actions/purchases';
import * as XLSX from 'xlsx';

interface Purchase {
  id: string;
  purchaseNo: string;
  date: Date;
  supplier: { name: string };
  items: any[];
  total: number;
  status: string;
}

interface PurchasesClientProps {
  purchases: Purchase[];
  isOwner: boolean;
}

export default function PurchasesClient({ purchases, isOwner }: PurchasesClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPurchases = useMemo(() => {
    return purchases.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      return true;
    });
  }, [purchases, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredPurchases.map(p => p.id)));
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
    const itemsToExport = purchases.filter(p => selectedIds.has(p.id));
    const data = itemsToExport.map(p => ({
      "Purchase No": p.purchaseNo,
      "Date": new Date(p.date).toLocaleDateString(),
      "Supplier": p.supplier.name,
      "Items": p.items.length,
      "Total Amount": p.total,
      "Status": p.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchases");
    XLSX.writeFile(workbook, `Purchases_Export.xlsx`);
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
        </div>
      )}

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <input 
                  type="checkbox" 
                  checked={filteredPurchases.length > 0 && selectedIds.size === filteredPurchases.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>Purchase No</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="desktop-only text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPurchases.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Purchases Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters or search terms.</span>
                  </div>
                </td>
              </tr>
            ) : filteredPurchases.map((purchase) => (
              <tr key={purchase.id} style={{ background: selectedIds.has(purchase.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(purchase.id)}
                    onChange={() => handleSelect(purchase.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">{purchase.purchaseNo}</td>
                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                <td className="font-medium">{purchase.supplier.name}</td>
                <td>{purchase.items.length} items</td>
                <td>₹{purchase.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  <span className={`status-badge ${purchase.status.toLowerCase()}`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="desktop-only">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Link href={`/purchases/${purchase.id}/print`} className="btn-icon" target="_blank" title="View Purchase">
                      <FileText size={16} />
                    </Link>
                    {isOwner && (
                      <DeleteButton id={purchase.id} action={deletePurchase} itemType="purchase" />
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
