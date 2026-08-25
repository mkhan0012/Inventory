"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2, ArrowLeftRight, RefreshCcw } from 'lucide-react';
import { processSalesReturn } from '@/actions/returns';
import toast from 'react-hot-toast';

export default function ProcessReturnModal({ customers, products }: { customers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [customerId, setCustomerId] = useState('');
  const [reason, setReason] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; refundAmount: number }[]>([]);
  const [success, setSuccess] = useState(false);

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
      setSuccess(true);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setSuccess(false);
      setItems([]);
      setCustomerId('');
      setReason('');
    }, 300);
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)', border: 'none' }}>
        <RefreshCcw size={16} /> Process Return
      </button>

      {isOpen && (
        <div className="drawer-overlay" onClick={handleClose}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header" style={{ borderBottom: '1px solid rgba(239, 68, 68, 0.1)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)' }}>
                  <ArrowLeftRight size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', background: 'linear-gradient(90deg, var(--text-main) 0%, #ef4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Sales Return</h2>
                  <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>Restock & Refund</span>
                </div>
              </div>
              <button className="close-btn" type="button" onClick={handleClose} style={{ background: 'transparent', border: '1px solid rgba(239, 68, 68, 0.2)' }}><X size={20} /></button>
            </div>
            
            {success ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '35px', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-main)' }}>Return Processed!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Inventory has been restocked and customer dues adjusted.</p>
                <button className="btn-outline" onClick={handleClose} style={{ padding: '12px 24px', fontSize: '15px' }}>Close Window</button>
              </div>
            ) : (
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
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }}
                  />
                  <datalist id="customers-list">
                    {customers.map(c => <option key={c.id} value={c.name}>{c.phone || 'No Phone'}</option>)}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Reason for Return</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Defective, Wrong Item..." 
                    value={reason} 
                    onChange={e => setReason(e.target.value)} 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 600 }}>Returned Items</h3>
                  <button type="button" onClick={addItem} className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Add Item
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, index) => (
                    <div key={index} className="billing-item-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div className="form-group" style={{ flex: 2, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Product</label>
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
                          style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }}
                        />
                        <datalist id={`product-list-${index}`}>
                          {products.map(p => <option key={p.id} value={p.name}>{p.code}</option>)}
                        </datalist>
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Quantity</label>
                        <input type="number" required min="1" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Refund Rate (₹)</label>
                        <input type="number" required step="0.01" value={item.refundAmount} onChange={e => updateItem(index, 'refundAmount', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Total (₹)</label>
                        <div style={{ padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '6px', border: '1px solid var(--border)', color: 'var(--text-main)', fontWeight: 600, fontSize: '13px', textAlign: 'right' }}>
                          {(item.quantity * item.refundAmount).toFixed(2)}
                        </div>
                      </div>
                      <button type="button" onClick={() => removeItem(index)} className="btn-icon" style={{ padding: '10px', color: 'var(--danger)', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', marginTop: '22px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '14px', border: '2px dashed var(--border)', borderRadius: '12px', background: 'var(--bg-main)' }}>
                      No items added for return. <br/> Click "Add Item" to start processing a refund.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="summary-row" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>
                  <p style={{ margin: 0 }}>This amount will be deducted from the customer's dues (if applicable) and inventory will be instantly restocked.</p>
                </div>
                <div className="summary-totals" style={{ width: '300px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                    <span>Total Refund:</span>
                    <span className="text-danger">-₹{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="drawer-footer" style={{ marginTop: '24px', padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" className="btn-outline" onClick={handleClose} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0} style={{ padding: '12px 32px', fontSize: '15px', background: 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)', border: 'none' }}>
                  {loading ? 'Processing...' : 'Confirm Return'}
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
