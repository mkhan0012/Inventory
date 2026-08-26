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
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(239,68,68,0.3)', border: 'none' }}>
        <Plus size={16} /> Log Expense
      </button>

      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', border: '1px solid rgba(239,68,68,0.1)' }}>
            <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(239,68,68,0.1)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(239,68,68,0.3)' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', background: 'linear-gradient(90deg, var(--text-main) 0%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Log Expense</h2>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Record spending</span>
                </div>
              </div>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(239,68,68,0.2)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Category</label>
                <select name="category" required style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}>
                  <option value="Electricity">Electricity</option>
                  <option value="Transport">Transport / Freight</option>
                  <option value="Tea & Snacks">Tea & Snacks</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Salary">Salary / Wages</option>
                  <option value="Miscellaneous">Miscellaneous</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Description</label>
                <input name="description" required placeholder="e.g. Paid for tea" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Amount (₹)</label>
                <input name="amount" type="number" step="0.01" required placeholder="0.00" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
              </div>
              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Date (Optional for past records)</label>
                <input name="date" type="date" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
              </div>
              
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none' }}>
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
