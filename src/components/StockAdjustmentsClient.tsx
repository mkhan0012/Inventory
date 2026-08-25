"use client";
import React, { useState, useMemo } from 'react';
import { FileText, Download, CheckCircle } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import { deleteStockAdjustment } from '@/actions/stock-adjustments';
import * as XLSX from 'xlsx';

interface StockAdjustment {
  id: string;
  adjustNo: string;
  date: Date;
  reason: string;
  notes: string | null;
  items: any[];
}

interface StockAdjustmentsClientProps {
  adjustments: StockAdjustment[];
  isOwner: boolean;
}

export default function StockAdjustmentsClient({ adjustments, isOwner }: StockAdjustmentsClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(adjustments.map(p => p.id)));
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
    const itemsToExport = adjustments.filter(p => selectedIds.has(p.id));
    const data = itemsToExport.map(p => ({
      "Adjustment No": p.adjustNo,
      "Date": new Date(p.date).toLocaleDateString(),
      "Reason": p.reason,
      "Notes": p.notes || '',
      "Items": p.items.length
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Stock_Adjustments");
    XLSX.writeFile(workbook, `Stock_Adjustments_Export.xlsx`);
  };

  return (
    <>
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
                  checked={adjustments.length > 0 && selectedIds.size === adjustments.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>Adjustment No</th>
              <th>Date</th>
              <th>Reason</th>
              <th>Notes</th>
              <th>Items Adjusted</th>
              <th className="desktop-only text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {adjustments.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <FileText size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Stock Adjustments Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search terms.</span>
                  </div>
                </td>
              </tr>
            ) : adjustments.map((adj) => (
              <tr key={adj.id} style={{ background: selectedIds.has(adj.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(adj.id)}
                    onChange={() => handleSelect(adj.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td className="text-primary font-medium">{adj.adjustNo}</td>
                <td>{new Date(adj.date).toLocaleDateString()}</td>
                <td><span className="status-badge" style={{ background: 'rgba(156, 163, 175, 0.2)', color: 'var(--text-main)' }}>{adj.reason}</span></td>
                <td>{adj.notes || '-'}</td>
                <td>{adj.items.length} items</td>
                <td className="desktop-only">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {isOwner && (
                      <DeleteButton id={adj.id} action={deleteStockAdjustment} itemType="adjustment" />
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
