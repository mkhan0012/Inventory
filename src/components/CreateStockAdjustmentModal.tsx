"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { createStockAdjustment } from '@/actions/stock-adjustments';
import toast from 'react-hot-toast';
import './AddProductModal.css';

export default function CreateStockAdjustmentModal({ products }: { products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [reason, setReason] = useState('Damage');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantityChanged: number }[]>([]);

  const addItem = () => {
    setItems([...items, { productId: '', quantityChanged: 0 }]);
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      newItems[index] = { ...newItems[index], productId: value as string };
    } else {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason || items.length === 0 || items.some(i => !i.productId || i.quantityChanged === 0)) {
      toast.error("Please provide a reason and add at least one valid item with a non-zero quantity change.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await createStockAdjustment({
        reason,
        notes,
        items,
        date: date ? date : undefined
      });
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Stock adjustment created successfully");
        setIsOpen(false);
        setItems([]);
        setReason('Damage');
        setNotes('');
        setDate('');
      }
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <Plus size={16} /> New Adjustment
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2>Create Stock Adjustment</h2>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Reason</label>
                  <select required value={reason} onChange={e => setReason(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }}>
                    <option value="Damage">Damage</option>
                    <option value="Theft">Theft</option>
                    <option value="Audit">Audit / Count Error</option>
                    <option value="Promotion">Promotion</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date (Optional)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Notes (Optional)</label>
                  <input type="text" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional details..." style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }} />
                </div>
              </div>

              <div style={{ marginTop: '16px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '14px', color: 'var(--text-main)' }}>Items</h3>
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
                            {p.name} | Current Stock: {p.stock}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ flex: 1 }}>
                      <label style={{ fontSize: '11px' }}>Qty Change (+/-)</label>
                      <input type="number" required step="0.01" value={item.quantityChanged} onChange={e => updateItem(index, 'quantityChanged', e.target.value)} placeholder="e.g. -2 or 5" style={{ padding: '8px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-main)', color: 'var(--text-main)' }} />
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="btn-icon" style={{ padding: '8px', color: 'var(--danger)', border: '1px solid var(--border)' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="modal-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0}>
                  {loading ? 'Creating...' : 'Create Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
