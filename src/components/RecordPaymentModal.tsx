"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createPayment } from '@/actions/payments';
import toast from 'react-hot-toast';
import './AddProductModal.css';

export default function RecordPaymentModal({ customers, suppliers }: { customers: any[], suppliers: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('INCOMING'); // INCOMING or OUTGOING

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await createPayment({
        amount: parseFloat(formData.get('amount') as string),
        type,
        method: formData.get('method') as string,
        customerId: type === 'INCOMING' ? formData.get('partyId') as string : undefined,
        supplierId: type === 'OUTGOING' ? formData.get('partyId') as string : undefined,
      });
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    }

    setLoading(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(16,185,129,0.3)', border: 'none' }}>
        <Plus size={16} /> Record Payment
      </button>

      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', border: '1px solid rgba(16,185,129,0.1)' }}>
            <div className="drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid rgba(16,185,129,0.1)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(16,185,129,0.3)' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '20px', background: 'linear-gradient(90deg, var(--text-main) 0%, #10b981 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Record Payment</h2>
                  <span style={{ fontSize: '12px', color: '#10b981', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Settle Balances</span>
                </div>
              </div>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(16,185,129,0.2)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Payment Type</label>
                <select name="type" value={type} onChange={e => setType(e.target.value)} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}>
                  <option value="INCOMING">Incoming (Received from Customer)</option>
                  <option value="OUTGOING">Outgoing (Paid to Supplier)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>{type === 'INCOMING' ? 'Customer' : 'Supplier'}</label>
                <select name="partyId" required style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}>
                  <option value="">-- Select {type === 'INCOMING' ? 'Customer' : 'Supplier'} --</option>
                  {type === 'INCOMING' 
                    ? customers.map(c => <option key={c.id} value={c.id}>{c.name} (Due: ₹{c.dueAmount.toFixed(2)})</option>)
                    : suppliers.map(s => <option key={s.id} value={s.id}>{s.name} (Due: ₹{s.dueAmount.toFixed(2)})</option>)
                  }
                </select>
              </div>

              <div className="form-row" style={{ marginBottom: '24px', display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Amount (₹)</label>
                  <input name="amount" type="number" step="0.01" required placeholder="0.00" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Payment Method</label>
                  <select name="method" required style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '10px 24px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none' }}>
                  {loading ? 'Recording...' : 'Record Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
