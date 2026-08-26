"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { createPurchaseOrder } from '@/actions/purchase-orders';
import toast from 'react-hot-toast';
import './AddProductModal.css';

export default function CreatePurchaseOrderModal({ suppliers, products }: { suppliers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [supplierId, setSupplierId] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; rate: number }[]>([]);

  const addItem = () => {
    setItems([...items, { productId: '', quantity: 1, rate: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value as string, rate: product ? product.purchasePrice || product.price : 0 };
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
      const res = await createPurchaseOrder({
        supplierId,
        items,
        date: date ? date : undefined
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Purchase Order created successfully");
        setIsOpen(false);
        setItems([]);
        setSupplierId('');
        setDate('');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(59,130,246,0.3)', border: 'none' }}>
        <Plus size={16} /> Create PO
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
                  <h2 style={{ fontSize: '22px', background: 'linear-gradient(90deg, var(--text-main) 0%, #3b82f6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Smart PO</h2>
                  <span style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Purchase Order Draft</span>
                </div>
              </div>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: '1px solid rgba(59,130,246,0.2)' }}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Select Supplier</label>
                  <select required value={supplierId} onChange={e => setSupplierId(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }}>
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date (Optional)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }} />
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 600 }}>PO Items</h3>
                  <button type="button" onClick={addItem} className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Manually Add Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, index) => (
                    <div key={index} className="billing-item-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div className="form-group" style={{ flex: 2, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Product</label>
                        <select required value={item.productId} onChange={e => updateItem(index, 'productId', e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }}>
                          <option value="">-- Select Product --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              [{p.category}] {p.name} (Stock: {p.stock})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Quantity</label>
                        <input type="number" required min="0.01" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Rate (₹)</label>
                        <input type="number" required step="0.01" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Amount (₹)</label>
                        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>
                          {(item.quantity * item.rate).toFixed(2)}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(index)} className="btn-icon" style={{ padding: '10px', color: 'var(--danger)', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', marginTop: '22px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px', border: '2px dashed var(--border)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                    No items added. <br/> Click "Add Row" to start.
                  </div>
                )}
              </div>

              <div className="summary-row" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <div className="summary-totals" style={{ width: '300px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    <span>Total Amount:</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer" style={{ marginTop: '24px', padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0} style={{ padding: '12px 32px', fontSize: '15px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none' }}>
                  {loading ? 'Creating...' : 'Create PO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
