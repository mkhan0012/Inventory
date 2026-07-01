"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createProduct } from '@/actions/inventory';
import './AddProductModal.css';

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [location, setLocation] = useState('Store Front');
  const [unit, setUnit] = useState('Pieces');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    
    await createProduct({
      code: formData.get('code') as string,
      name: formData.get('name') as string,
      category: formData.get('category') as string,
      stock,
      location,
      unit: formData.get('unit') as string,
      price: parseFloat(formData.get('price') as string),
    });

    setLoading(false);
    setIsOpen(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Add New Item
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Item</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Item Code</label>
                <input name="code" required placeholder="e.g. HP-1008" />
              </div>
              <div className="form-group">
                <label>Item Name</label>
                <input name="name" required placeholder="e.g. Hydraulic Hose" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input name="category" required placeholder="e.g. Hose" />
                </div>
                <div className="form-group">
                  <label>Initial Stock</label>
                  <input type="number" required min="0" value={stock} onChange={e => setStock(Number(e.target.value))} />
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <select value={location} onChange={e => setLocation(e.target.value)}>
                    <option value="Store Front">Store Front</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit</label>
                  <input name="unit" required placeholder="e.g. Meter" />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input name="price" type="number" step="0.01" required placeholder="0.00" />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
