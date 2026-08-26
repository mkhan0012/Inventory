"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updateExpense } from '@/actions/expenses';
import './AddProductModal.css';

interface EditExpenseModalProps {
  expense: { id: string; description: string; amount: number; category: string; date: string };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditExpenseModal({ expense, isOpen, onClose }: EditExpenseModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateExpense(expense.id, {
        description: formData.get('description') as string,
        amount: parseFloat(formData.get('amount') as string),
        category: formData.get('category') as string,
        date: formData.get('date') as string,
      });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', border: '1px solid rgba(245,158,11,0.1)' }}>
        <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(245,158,11,0.1)', paddingBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(245,158,11,0.3)' }}>
              <X size={20} style={{ transform: 'rotate(45deg)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '20px', background: 'linear-gradient(90deg, var(--text-main) 0%, #d97706 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Edit Expense</h2>
              <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Update Record</span>
            </div>
          </div>
          <button className="close-btn" type="button" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(245,158,11,0.2)' }}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Description</label>
            <input name="description" required defaultValue={expense.description} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
          </div>
          
          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Amount (₹)</label>
            <input name="amount" type="number" step="0.01" required defaultValue={expense.amount} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
          </div>
          
          <div className="form-row" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Category</label>
              <select name="category" required defaultValue={expense.category} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}>
                <option value="Salary">Salary</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Supplies">Supplies</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Date</label>
              <input name="date" type="date" required defaultValue={new Date(expense.date).toISOString().split('T')[0]} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
            </div>
          </div>
          
          <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button type="button" className="btn-outline" onClick={onClose} style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', border: 'none' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
