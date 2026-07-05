"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { createPurchase } from '@/actions/purchases';
import toast from 'react-hot-toast';
import './AddProductModal.css';

export default function CreatePurchaseModal({ suppliers, products }: { suppliers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [supplierId, setSupplierId] = useState('');
  const [status, setStatus] = useState('PAID');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; rate: number }[]>([]);

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

  const total = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supplierId || items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please fill all required fields and add at least one valid item.");
      return;
    }
    
    setLoading(true);
    try {
      await createPurchase({
        supplierId,
        items,
        status,
        date: date ? date : undefined
      });
      setIsOpen(false);
      setItems([]);
      setSupplierId('');
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> Record Purchase
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Record New Purchase</h2>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Select Supplier</label>
                  <select required value={supplierId} onChange={e => setSupplierId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Payment Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="PAID">Paid</option>
                    <option value="DUE">Due</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date (Optional)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-main)' }}>Purchase Items</h3>
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
                          <option key={p.id} value={p.id}>
                            {p.name} | Cat: {p.category} | Stock: {p.stock} | Buy: ₹{p.purchasePrice} | Sell: ₹{p.price}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Quantity</label>
                      <input type="number" required min="1" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Purchase Rate</label>
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
              </div>

              <div className="form-row" style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px', justifyContent: 'flex-end' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                  <span style={{ marginRight: '16px' }}>Total Amount:</span>
                  <span className="text-primary">₹{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0}>
                  {loading ? 'Recording...' : 'Record Purchase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
