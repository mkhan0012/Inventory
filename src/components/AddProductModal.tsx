"use client";
import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { createProduct } from '@/actions/inventory';
import './AddProductModal.css';

export default function AddProductModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [stock, setStock] = useState(0);
  const [location, setLocation] = useState('Store Front');
  const [unit, setUnit] = useState('Pieces');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    try {
      await createProduct({
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
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)', border: 'none' }}>
        <Plus size={16} /> Add New Item
      </button>

      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(59,130,246,0.3)' }}>
                  <Plus size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', background: 'linear-gradient(90deg, var(--text-main) 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Add New Item</h2>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Inventory Creation</span>
                </div>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(59,130,246,0.2)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form" style={{ padding: '24px' }}>
              {error && <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}
              
              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Item Code</label>
                  <input name="code" required placeholder="e.g. HP-1008" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 2, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Item Name</label>
                  <input name="name" required placeholder="e.g. Hydraulic Hose" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Category</label>
                  <input name="category" required placeholder="e.g. Hose" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Initial Stock</label>
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

              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Unit</label>
                  <input name="unit" required placeholder="e.g. Meter" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Purchase Price (₹)</label>
                  <input name="purchasePrice" type="number" step="0.01" required placeholder="0.00" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Selling Price (₹)</label>
                  <input name="price" type="number" step="0.01" required placeholder="0.00" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>HSN Code (Optional)</label>
                  <input name="hsnCode" placeholder="e.g. 8412" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
                <div className="form-group" style={{ flex: 1, margin: 0 }}>
                  <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Tax Rate % (Optional)</label>
                  <input name="taxRate" type="number" step="0.1" placeholder="18" style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }} />
                </div>
              </div>
              
              <div className="drawer-footer" style={{ marginTop: '24px', padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: '16px', margin: '0 -24px -24px -24px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading} style={{ padding: '12px 32px', fontSize: '15px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none' }}>
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
