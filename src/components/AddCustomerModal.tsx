"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createCustomer } from '@/actions/customers';
import './AddProductModal.css';

export default function AddCustomerModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    await createCustomer({
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
    });

    setLoading(false);
    setIsOpen(false);
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
