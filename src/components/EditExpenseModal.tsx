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
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Expense</h2>
          <button className="close-btn" type="button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}
          <div className="form-group">
            <label>Description</label>
            <input name="description" required defaultValue={expense.description} />
          </div>
          <div className="form-group">
            <label>Amount (₹)</label>
            <input name="amount" type="number" step="0.01" required defaultValue={expense.amount} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Category</label>
              <select name="category" required defaultValue={expense.category}>
                <option value="Salary">Salary</option>
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Supplies">Supplies</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Marketing">Marketing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input name="date" type="date" required defaultValue={new Date(expense.date).toISOString().split('T')[0]} />
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
