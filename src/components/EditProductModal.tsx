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

interface EditProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProductModal({ product, isOpen, onClose }: EditProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [stock, setStock] = useState(product.stock);
  const [location, setLocation] = useState(product.location);

  // Update local state when product prop changes
  React.useEffect(() => {
    setStock(product.stock);
    setLocation(product.location);
  }, [product]);

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
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div className="drawer-overlay" onClick={onClose}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
                  <Edit2 size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', background: 'linear-gradient(90deg, var(--text-main) 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Edit Item</h2>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Update Inventory</span>
                </div>
              </div>
              <button type="button" className="close-btn" onClick={onClose} style={{ background: 'transparent', border: '1px solid rgba(59,130,246,0.2)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form" style={{ padding: '24px' }}>
              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
              
              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Item Code</label>
                  <input name="code" required defaultValue={product.code} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Item Name</label>
                  <input name="name" required defaultValue={product.name} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Category</label>
                  <input name="category" required defaultValue={product.category} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Current Stock</label>
                  <input type="number" step="0.01" required min="0" value={stock} onChange={e => setStock(Number(e.target.value))} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Location</label>
                  <select value={location} onChange={e => setLocation(e.target.value)} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}>
                    <option value="Store Front">Store Front</option>
                    <option value="Warehouse">Warehouse</option>
                  </select>
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Unit</label>
                  <input name="unit" required defaultValue={product.unit} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Purchase Price (₹)</label>
                  <input name="purchasePrice" type="number" step="0.01" required defaultValue={product.purchasePrice} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Selling Price (₹)</label>
                  <input name="price" type="number" step="0.01" required defaultValue={product.price} style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
              </div>
              
              <div className="drawer-footer" style={{ marginTop: '24px', padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: '16px', margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn-outline" onClick={onClose} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 32px', fontSize: '15px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none' }}>
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
