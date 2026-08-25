"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2, ArrowLeftRight } from 'lucide-react';
import { processSalesReturn } from '@/actions/returns';
import toast from 'react-hot-toast';

export default function ProcessReturnModal({ customers, products }: { customers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [customerId, setCustomerId] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; refundAmount: number }[]>([]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, refundAmount: 0 }]);

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value as string, refundAmount: product ? product.price : 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.refundAmount), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please add at least one valid item to return.");
      return;
    }
    
    setLoading(true);
    try {
      await processSalesReturn({
        customerId: customerId || undefined,
        reason,
        items
      });
      toast.success("Return processed successfully!");
      setIsOpen(false);
      setItems([]);
      setCustomerId('');
      setReason('');
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)}>
        <ArrowLeftRight size={16} /> Process Return
      </button>

      {isOpen && (
        <div className="drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header">
              <h2>Process Sales Return</h2>
              <button className="close-btn" type="button" onClick={() => setIsOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Customer Name (Optional)</label>
                  <input 
                    list="customers-list" 
                    placeholder="Search Customer..."
                    value={customers.find(c => c.id === customerId)?.name || customerId}
                    onChange={e => {
                      const match = customers.find(c => c.name === e.target.value);
                      if (match) setCustomerId(match.id);
                      else setCustomerId(e.target.value); 
                    }} 
                  />
                  <datalist id="customers-list">
                    {customers.map(c => <option key={c.id} value={c.name}>{c.phone || 'No Phone'}</option>)}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Reason for Return</label>
                  <input type="text" placeholder="e.g. Defective, Wrong Item..." value={reason} onChange={e => setReason(e.target.value)} />
                </div>
              </div>

              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px' }}>Returned Items</h3>
                <button type="button" onClick={addItem} className="btn-outline" style={{ padding: '6px 12px', fontSize: '13px', display: 'flex', gap: '4px' }}>
                  <Plus size={14} /> Add Item
                </button>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {items.map((item, index) => (
                  <div key={index} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                    <div className="form-group" style={{ flex: 2, margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Product</label>
                      <input 
                        list={`product-list-${index}`} 
                        placeholder="Search product..."
                        required
                        value={products.find(p => p.id === item.productId)?.name || item.productId}
                        onChange={e => {
                          const val = e.target.value;
                          const product = products.find(p => p.name === val || p.code === val);
                          if (product) updateItem(index, 'productId', product.id);
                          else updateItem(index, 'productId', val);
                        }}
                      />
                      <datalist id={`product-list-${index}`}>
                        {products.map(p => <option key={p.id} value={p.name}>{p.code}</option>)}
                      </datalist>
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Quantity</label>
                      <input type="number" required min="1" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Unit Refund (₹)</label>
                      <input type="number" required step="0.01" value={item.refundAmount} onChange={e => updateItem(index, 'refundAmount', e.target.value)} />
                    </div>
                    <div className="form-group" style={{ flex: 1, margin: 0 }}>
                      <label style={{ fontSize: '12px' }}>Total</label>
                      <div style={{ padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', textAlign: 'right', border: '1px solid var(--border)' }}>
                        {(item.quantity * item.refundAmount).toFixed(2)}
                      </div>
                    </div>
                    <button type="button" onClick={() => removeItem(index)} className="btn-icon" style={{ padding: '10px', color: 'var(--danger)', marginTop: '20px' }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {items.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', border: '2px dashed var(--border)', borderRadius: '8px' }}>
                    No items added for return.
                  </div>
                )}
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{ background: 'var(--bg-main)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border)', minWidth: '250px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 'bold' }}>
                    <span>Total Refund:</span>
                    <span className="text-danger">-₹{totalAmount.toFixed(2)}</span>
                  </div>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0 }}>
                    This amount will be deducted from the customer's dues (if applicable) and inventory will be restocked.
                  </p>
                </div>
              </div>

              <div className="drawer-footer">
                <button type="button" className="btn-outline" onClick={() => setIsOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0}>
                  {loading ? 'Processing...' : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
