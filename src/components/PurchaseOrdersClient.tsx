"use client";
import React, { useState, useMemo } from 'react';
import { FileText, Download, Filter, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import DeleteButton from '@/components/DeleteButton';
import { deletePurchaseOrder, updatePurchaseOrderStatus } from '@/actions/purchase-orders';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

interface PurchaseOrder {
  id: string;
  poNumber: string;
  date: Date;
  supplier: { name: string };
  items: any[];
  total: number;
  status: string;
}

interface PurchaseOrdersClientProps {
  purchaseOrders: PurchaseOrder[];
  isOwner: boolean;
}

export default function PurchaseOrdersClient({ purchaseOrders, isOwner }: PurchaseOrdersClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState('All');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredOrders = useMemo(() => {
    return purchaseOrders.filter(p => {
      if (statusFilter !== 'All' && p.status !== statusFilter) return false;
      return true;
    });
  }, [purchaseOrders, statusFilter]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredOrders.map(p => p.id)));
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
    const itemsToExport = purchaseOrders.filter(p => selectedIds.has(p.id));
    const data = itemsToExport.map(p => ({
      "PO Number": p.poNumber,
      "Date": new Date(p.date).toLocaleDateString(),
      "Supplier": p.supplier.name,
      "Items": p.items.length,
      "Total Amount": p.total,
      "Status": p.status
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase_Orders");
    XLSX.writeFile(workbook, `Purchase_Orders_Export.xlsx`);
  };

  const handleMarkCompleted = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await updatePurchaseOrderStatus(id, 'COMPLETED');
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("PO marked as COMPLETED");
      }
    } catch (e: any) {
      toast.error(e.message || "Error updating status");
    } finally {
      setLoadingId(null);
    }
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
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
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
                  checked={filteredOrders.length > 0 && selectedIds.size === filteredOrders.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>PO Number</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th className="desktop-only text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Purchase Orders Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your filters or search terms.</span>
                  </div>
                </td>
              </tr>
            ) : filteredOrders.map((po) => (
              <tr key={po.id} style={{ background: selectedIds.has(po.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(po.id)}
                    onChange={() => handleSelect(po.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">{po.poNumber}</td>
                <td>{new Date(po.date).toLocaleDateString()}</td>
                <td className="font-medium">{po.supplier.name}</td>
                <td>{po.items.length} items</td>
                <td>₹{po.total.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                <td>
                  <span className={`status-badge ${po.status.toLowerCase()}`}>
                    {po.status}
                  </span>
                </td>
                <td className="desktop-only">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {po.status === 'PENDING' && (
                       <button 
                         onClick={() => handleMarkCompleted(po.id)} 
                         disabled={loadingId === po.id}
                         className="btn-icon" 
                         title="Mark as Completed"
                         style={{ color: 'var(--success)' }}
                       >
                         <CheckCircle size={16} />
                       </button>
                    )}
                    {isOwner && (
                      <DeleteButton id={po.id} action={deletePurchaseOrder} itemType="purchase order" />
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
