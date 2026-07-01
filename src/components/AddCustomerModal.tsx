"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createCustomer } from '@/actions/customers';
import './AddProductModal.css';

export default function AddCustomerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await createCustomer({
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
      });
      setIsOpen(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Add Customer
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Customer</h2>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}
              <div className="form-group">
                <label>Customer Name</label>
                <input name="name" required placeholder="e.g. M/s Shakti Engineering" />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input name="phone" required placeholder="e.g. +91 9876543210" />
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
