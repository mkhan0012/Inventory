"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2, ScanLine } from 'lucide-react';
import { createQuotation } from '@/actions/quotations';
import './AddProductModal.css';

export default function CreateQuotationModal({ customers, products }: { customers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [customerId, setCustomerId] = useState('');
  const [tax, setTax] = useState(0);
  const [items, setItems] = useState<{ productId: string; quantity: number; rate: number }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [date, setDate] = useState('');
  const [createdEstimateId, setCreatedEstimateId] = useState<string | null>(null);

  const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const product = products.find(p => p.barcode === barcodeInput || p.code === barcodeInput);
      if (product) {
        // check if already in items
        const existingIndex = items.findIndex(i => i.productId === product.id);
        if (existingIndex >= 0) {
          const newItems = [...items];
          newItems[existingIndex].quantity += 1;
          setItems(newItems);
        } else {
          setItems([...items, { productId: product.id, quantity: 1, rate: product.price }]);
        }
      } else {
        alert("Product with barcode/code not found!");
      }
      setBarcodeInput('');
    }
  };

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, rate: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value as string, rate: product ? product.price : 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0 || items.some(i => !i.productId)) {
      alert("Please fill all required fields and add at least one valid item.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await createQuotation({
        customerId,
        items,
        tax,
        date: date ? date : undefined
      });
      
      // Show the success screen instead of auto-opening
      setCreatedEstimateId(res.id);
    } catch (error: any) {
      alert(error.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreatedEstimateId(null);
    setItems([]);
    setCustomerId('');
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Create Estimate
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>{createdEstimateId ? 'Success' : 'Create New Estimate'}</h2>
              <button className="close-btn" type="button" onClick={handleClose}><X size={20} /></button>
            </div>
            
            {createdEstimateId ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ width: '60px', height: '60px', borderRadius: '30px', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '20px', marginBottom: '10px' }}>Estimate Created Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Your estimate has been saved.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <a href={`/quotations/${createdEstimateId}/print`} target="_blank" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print Estimate
                  </a>
                  <button className="btn-outline" onClick={handleClose}>Close Window</button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Select Customer</label>
                  <select required value={customerId} onChange={e => setCustomerId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="">-- Choose Customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone || 'No Phone'})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Date (Optional for past records)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
                <div className="form-group">
                  <label>Scan Barcode</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-main)', padding: '0 10px' }}>
                     <ScanLine size={16} color="var(--text-muted)" />
                     <input 
                       type="text" 
                       placeholder="Scan or type code + Enter" 
                       value={barcodeInput} 
                       onChange={e => setBarcodeInput(e.target.value)} 
                       onKeyDown={handleBarcodeScan}
                       style={{ border: 'none', background: 'transparent', padding: '10px', color: 'var(--text-main)', width: '100%', outline: 'none' }} 
                     />
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-main)' }}>Estimate Items</h3>
                  <button type="button" onClick={addItem} className="btn-outline" style={{ padding: '6px 12px', fontSize: '12px' }}>
                    <Plus size={14} /> Add Item
                  </button>
                </div>

                {items.map((item, index) => (
                  <div key={index} className="form-row" style={{ alignItems: 'flex-end', marginBottom: '8px' }}>
                    <div className="form-group" style={{ flex: 2 }}>
                      <label style={{ fontSize: '11px' }}>Product</label>
                      <select required value={item.productId} onChange={e => updateItem(index, 'productId', e.target.value)} style={{ padding: '8px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                        <option value="">-- Select --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Quantity</label>
                      <input type="number" required min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Rate</label>
                      <input type="number" required step="0.01" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Amount</label>
                      <div style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                        ₹{(item.quantity * item.rate).toFixed(2)}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="btn-icon" style={{ padding: '8px', color: 'var(--danger)', border: '1px solid var(--border)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                    No items added. Click "Add Item" or Scan Barcode.
                  </div>
                )}
              </div>

              <div className="form-row" style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', justifyContent: 'flex-end' }}>
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)' }}>
                    <span>Subtotal:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tax (₹):</span>
                    <input type="number" value={tax} onChange={e => setTax(Number(e.target.value))} style={{ width: '100px', padding: '6px', textAlign: 'right', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid var(--border)' }}>
                    <span>Total:</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={handleClose}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0}>
                  {loading ? 'Creating...' : 'Create Estimate'}
                </button>
              </div>
            </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
