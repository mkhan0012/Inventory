"use client";
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { updateSupplier } from '@/actions/suppliers';
import './AddProductModal.css';

interface EditSupplierModalProps {
  supplier: { id: string; name: string; phone: string | null };
  isOpen: boolean;
  onClose: () => void;
}

export default function EditSupplierModal({ supplier, isOpen, onClose }: EditSupplierModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateSupplier(supplier.id, {
        name: formData.get('name') as string,
        phone: formData.get('phone') as string,
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
          <h2>Edit Supplier</h2>
          <button className="close-btn" type="button" onClick={onClose}><X size={20} /></button>
        </div>
        
        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}
          <div className="form-group">
            <label>Supplier Name</label>
            <input name="name" required defaultValue={supplier.name} />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input name="phone" required defaultValue={supplier.phone || ''} />
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
