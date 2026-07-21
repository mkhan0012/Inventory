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
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Record Payment
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Record Payment</h2>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Payment Type</label>
                <select name="type" value={type} onChange={e => setType(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="INCOMING">Incoming (Received from Customer)</option>
                  <option value="OUTGOING">Outgoing (Paid to Supplier)</option>
                </select>
              </div>

              <div className="form-group">
                <label>{type === 'INCOMING' ? 'Customer' : 'Supplier'}</label>
                <select name="partyId" required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                  <option value="">-- Select {type === 'INCOMING' ? 'Customer' : 'Supplier'} --</option>
                  {type === 'INCOMING' 
                    ? customers.map(c => <option key={c.id} value={c.id}>{c.name} (Due: ₹{c.dueAmount.toFixed(2)})</option>)
                    : suppliers.map(s => <option key={s.id} value={s.id}>{s.name} (Due: ₹{s.dueAmount.toFixed(2)})</option>)
                  }
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Amount (₹)</label>
                  <input name="amount" type="number" step="0.01" required placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label>Payment Method</label>
                  <select name="method" required style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="CASH">Cash</option>
                    <option value="UPI">UPI</option>
                    <option value="BANK_TRANSFER">Bank Transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
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
