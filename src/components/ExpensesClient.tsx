"use client";
import React, { useState } from 'react';
import { Receipt, Download, Trash2, Edit2 } from 'lucide-react';
import DeleteButton from '@/components/DeleteButton';
import EditExpenseModal from '@/components/EditExpenseModal';
import { bulkDeleteExpenses, deleteExpense } from '@/actions/expenses';
import * as XLSX from 'xlsx';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
}

interface ExpensesClientProps {
  expenses: Expense[];
  isOwner: boolean;
}

export default function ExpensesClient({ expenses, isOwner }: ExpensesClientProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editingExpense, setEditingExpense] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(new Set(expenses.map(exp => exp.id)));
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
    if (!confirm(`Are you sure you want to delete ${selectedIds.size} expenses?`)) return;
    setIsDeleting(true);
    const result = await bulkDeleteExpenses(Array.from(selectedIds));
    if (result.error) {
      alert(result.error);
    } else {
      setSelectedIds(new Set());
    }
    setIsDeleting(false);
  };

  const handleBulkExport = () => {
    const itemsToExport = expenses.filter(exp => selectedIds.has(exp.id));
    const data = itemsToExport.map(exp => ({
      "Date": new Date(exp.date).toLocaleDateString(),
      "Category": exp.category,
      "Description": exp.description,
      "Amount": exp.amount
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, `Expenses_Export.xlsx`);
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
                  checked={expenses.length > 0 && selectedIds.size === expenses.length}
                  onChange={handleSelectAll}
                  style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
              {isOwner && <th className="desktop-only text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <Receipt size={48} color="var(--border)" style={{ marginBottom: '16px', opacity: 0.5 }} />
                    <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-main)' }}>No Expenses Found</span>
                    <span style={{ fontSize: '12px', marginTop: '4px' }}>Try adjusting your search or add a new expense.</span>
                  </div>
                </td>
              </tr>
            ) : expenses.map((expense) => (
              <tr key={expense.id} style={{ background: selectedIds.has(expense.id) ? 'var(--bg-main)' : 'transparent' }}>
                <td>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(expense.id)}
                    onChange={() => handleSelect(expense.id)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                </td>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td className="font-medium">{expense.category}</td>
                <td>{expense.description}</td>
                <td className="text-primary font-medium">₹{expense.amount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                {isOwner && (
                  <td className="desktop-only">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
                      <button 
                        type="button"
                        onClick={() => setEditingExpense(expense)}
                        title="Edit Expense"
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
                      <DeleteButton id={expense.id} action={deleteExpense} itemType="expense" />
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingExpense && (
        <EditExpenseModal 
          expense={editingExpense} 
          isOpen={true} 
          onClose={() => setEditingExpense(null)} 
        />
      )}
    </>
  );
}
