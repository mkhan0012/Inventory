"use client";
import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';
import { updateProduct } from '@/actions/inventory';
import './AddProductModal.css';

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  location: string;
  unit: string;
  price: number;
  purchasePrice: number;
}

export default function EditProductModal({ product }: { product: Product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stock, setStock] = useState(product.stock);
  const [location, setLocation] = useState(product.location);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await updateProduct(product.id, {
        code: formData.get('code') as string,
        name: formData.get('name') as string,
        category: formData.get('category') as string,
        stock,
        location,
        unit: formData.get('unit') as string,
        price: parseFloat(formData.get('price') as string),
        purchasePrice: parseFloat(formData.get('purchasePrice') as string) || 0,
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
      <button 
        type="button"
        title="Edit Product"
        onClick={() => setIsOpen(true)}
        style={{
          background: 'transparent',
          border: 'none',
          color: 'var(--primary)',
          cursor: 'pointer',
          padding: '4px',
        }}
      >
        <Edit2 size={16} />
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Item</h2>
              <button className="close-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '12px', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{error}</div>}
              <div className="form-group">
                <label>Item Code</label>
                <input name="code" required defaultValue={product.code} />
              </div>
              <div className="form-group">
                <label>Item Name</label>
                <input name="name" required defaultValue={product.name} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <input name="category" required defaultValue={product.category} />
                </div>
                <div className="form-group">
                  <label>Current Stock</label>
                  <input type="number" step="0.01" required min="0" value={stock} onChange={e => setStock(Number(e.target.value))} />
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
                  <input name="unit" required defaultValue={product.unit} />
                </div>
                <div className="form-group">
                  <label>Purchase Price (₹)</label>
                  <input name="purchasePrice" type="number" step="0.01" required defaultValue={product.purchasePrice} />
                </div>
                <div className="form-group">
                  <label>Selling Price (₹)</label>
                  <input name="price" type="number" step="0.01" required defaultValue={product.price} />
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
