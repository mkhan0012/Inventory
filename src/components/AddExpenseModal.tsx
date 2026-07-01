"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createExpense } from '@/actions/expenses';
import './AddProductModal.css';

export default function AddExpenseModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    await createExpense({
      description: formData.get('description') as string,
      category: formData.get('category') as string,
      amount: parseFloat(formData.get('amount') as string),
      date: formData.get('date') as string,
    });

    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Log Expense
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Log New Expense</h2>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Category</label>
                <select name="category" required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="Electricity">Electricity</option>
                  <option value="Transport">Transport / Freight</option>
                  <option value="Tea & Snacks">Tea & Snacks</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Salary">Salary / Wages</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input name="description" required placeholder="e.g. Paid for tea" />
              </div>
              <div className="form-group">
                <label>Amount (₹)</label>
                <input name="amount" type="number" step="0.01" required placeholder="0.00" />
              </div>
              <div className="form-group">
                <label>Date (Optional for past records)</label>
                <input name="date" type="date" style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }} />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Log Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
