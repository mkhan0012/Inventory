"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2, ScanLine, Sparkles } from 'lucide-react';
import { createInvoice, getUpsellSuggestions } from '@/actions/sales';
import { useEffect } from 'react';
import toast from 'react-hot-toast';
import './AddProductModal.css';

export default function CreateInvoiceModal({ customers, products }: { customers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState('PAID');
  const [tax, setTax] = useState(0);
  const [date, setDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; rate: number }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [createdInvoiceId, setCreatedInvoiceId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const pIds = items.filter(i => i.productId).map(i => i.productId);
    if (pIds.length > 0) {
      getUpsellSuggestions(pIds).then(res => setSuggestions(res));
    } else {
      setSuggestions([]);
    }
  }, [items]);

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
        toast.error("Product with barcode/code not found!");
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

  const [discount, setDiscount] = useState(0);

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const total = subtotal - discount + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please fill all required fields and add at least one valid item.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await createInvoice({
        customerId,
        items,
        tax,
        discount,
        status,
        date: date ? date : undefined
      });
      
      // Show the success screen instead of auto-opening
      setCreatedInvoiceId(res.id);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreatedInvoiceId(null);
    setItems([]);
    setCustomerId('');
    setStatus('PAID');
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 15px rgba(41,98,255,0.3)', border: 'none' }}>
        <Sparkles size={16} /> Smart Invoice
      </button>

      {isOpen && (
        <div className="drawer-overlay" onClick={handleClose}>
          <div className="drawer-content" onClick={e => e.stopPropagation()}>
            <div className="drawer-header" style={{ borderBottom: '1px solid rgba(41,98,255,0.1)', padding: '20px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', boxShadow: '0 8px 16px rgba(41,98,255,0.3)' }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: '22px', background: 'linear-gradient(90deg, var(--text-main) 0%, var(--primary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>Smart Invoice</h2>
                  <span style={{ fontSize: '12px', color: '#8b5cf6', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase' }}>AI Enhanced Billing</span>
                </div>
              </div>
              <button className="close-btn" type="button" onClick={handleClose} style={{ background: 'transparent', border: '1px solid rgba(139,92,246,0.2)' }}><X size={20} /></button>
            </div>
            
            {createdInvoiceId ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '35px', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-main)' }}>Invoice Created Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Your invoice has been saved and customer balances updated.</p>
                
                <div className="success-actions" style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <a href={`/sales/${createdInvoiceId}/print`} target="_blank" className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', fontSize: '15px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print / Share Bill
                  </a>
                  <button className="btn-outline" onClick={handleClose} style={{ padding: '12px 24px', fontSize: '15px' }}>Close Window</button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1.5 }}>
                  <label>Customer Name</label>
                  <input 
                    list="customers-list" 
                    required 
                    placeholder="Search Customer..."
                    value={customers.find(c => c.id === customerId)?.name || customerId}
                    onChange={e => {
                      const match = customers.find(c => c.name === e.target.value);
                      if (match) setCustomerId(match.id);
                      else setCustomerId(e.target.value); // fallback to text, though validation will fail if not actual ID. Ideally handled via specific search component.
                    }} 
                    style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }} 
                  />
                  <datalist id="customers-list">
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.phone || 'No Phone'}</option>
                    ))}
                  </datalist>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Payment Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }}>
                    <option value="PAID">Paid</option>
                    <option value="DUE">Credit (Due)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date (Optional)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ margin: 0, color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ScanLine size={16} /> Neural Scan / Add Item
                    </label>
                    <span style={{ fontSize: '11px', background: 'rgba(139,92,246,0.1)', color: '#8b5cf6', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>AUTO-DETECT</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', background: 'var(--bg-card)', padding: '4px 12px', boxShadow: '0 0 0 4px rgba(139,92,246,0.05), inset 0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden' }}>
                     <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: 'linear-gradient(to bottom, var(--primary), #8b5cf6)' }}></div>
                     <input 
                       type="text" 
                       placeholder="Scan barcode or type exact product name + Enter to trigger AI match..." 
                       value={barcodeInput} 
                       onChange={e => setBarcodeInput(e.target.value)} 
                       onKeyDown={(e) => {
                         if (e.key === 'Enter') {
                           e.preventDefault();
                           const search = barcodeInput.toLowerCase().trim();
                           const product = products.find(p => 
                             (p.barcode && p.barcode.toLowerCase() === search) || 
                             p.code.toLowerCase() === search ||
                             p.name.toLowerCase() === search
                           );
                           if (product) {
                             const existingIndex = items.findIndex(i => i.productId === product.id);
                             if (existingIndex >= 0) {
                               const newItems = [...items];
                               newItems[existingIndex].quantity += 1;
                               setItems(newItems);
                             } else {
                               setItems([...items, { productId: product.id, quantity: 1, rate: product.price }]);
                             }
                             setBarcodeInput('');
                           } else {
                             toast.error("AI couldn't find a match! Try searching manually.");
                           }
                         }
                       }}
                       style={{ border: 'none', background: 'transparent', padding: '12px 12px 12px 16px', color: 'var(--text-main)', width: '100%', outline: 'none', fontSize: '14px', fontWeight: 500 }} 
                     />
                  </div>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '16px', color: 'var(--text-main)', fontWeight: 600 }}>Billing Items</h3>
                  <button type="button" onClick={addItem} className="btn-outline" style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Plus size={16} /> Manually Add Row
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {items.map((item, index) => (
                    <div key={index} className="billing-item-row" style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div className="form-group" style={{ flex: 2, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Search Product</label>
                        <input 
                          list={`product-list-${index}`} 
                          placeholder="Type to search product..."
                          required
                          value={products.find(p => p.id === item.productId)?.name || item.productId}
                          onChange={e => {
                            const val = e.target.value;
                            const product = products.find(p => p.name === val || p.code === val);
                            if (product) {
                              updateItem(index, 'productId', product.id);
                            } else {
                              // Temporarily store typed value, it will fail validation if not a real product ID when submitting
                              updateItem(index, 'productId', val);
                            }
                          }}
                          style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }}
                        />
                        <datalist id={`product-list-${index}`}>
                          {products.map(p => (
                            <option key={p.id} value={p.name}>{p.code} | ₹{p.price} | Stock: {p.stock}</option>
                          ))}
                        </datalist>
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Quantity</label>
                        <input type="number" required min="0.01" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Unit Price (₹)</label>
                        <input type="number" required step="0.01" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                        {item.productId && products.find(p => p.id === item.productId) && item.rate < (products.find(p => p.id === item.productId)?.price || 0) && (
                          <div style={{ color: 'var(--warning)', fontSize: '11px', marginTop: '4px', fontWeight: 500 }}>⚠️ Discounted</div>
                        )}
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Total (₹)</label>
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
                    No items in this invoice. <br/> Scan a barcode or click "Add Row" to start billing.
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'linear-gradient(145deg, rgba(139,92,246,0.05) 0%, rgba(41,98,255,0.05) 100%)', borderRadius: '12px', border: '1px solid rgba(139,92,246,0.2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, rgba(255,255,255,0) 70%)', filter: 'blur(10px)' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#8b5cf6', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Sparkles size={16} className="pulse-anim" /> AI Recommendations
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
                      {suggestions.map(s => (
                        <button 
                          key={s.id} 
                          type="button"
                          onClick={() => {
                            const newItems = [...items, { productId: s.id, quantity: 1, rate: s.price }];
                            setItems(newItems);
                          }}
                          style={{ background: 'var(--bg-card)', border: '1px solid rgba(139,92,246,0.2)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(139,92,246,0.05)', fontWeight: 500, transition: 'all 0.2s ease' }}
                          onMouseOver={(e) => e.currentTarget.style.borderColor = '#8b5cf6'}
                          onMouseOut={(e) => e.currentTarget.style.borderColor = 'rgba(139,92,246,0.2)'}
                        >
                          <Plus size={14} color="#8b5cf6" /> {s.name} <span style={{ color: 'var(--text-muted)' }}>| ₹{s.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="summary-row" style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>
                  <p style={{ margin: 0 }}>Ensure all items and rates are correct. Taxes will be added to the final grand total.</p>
                </div>
                <div className="summary-totals" style={{ width: '300px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Discount (-):</span>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}>₹</span>
                      <input type="number" min="0" step="0.01" value={discount} onChange={e => setDiscount(Number(e.target.value))} style={{ width: '120px', padding: '8px 8px 8px 24px', textAlign: 'right', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 500 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Tax Amount (+):</span>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}>₹</span>
                      <input type="number" min="0" step="0.01" value={tax} onChange={e => setTax(Number(e.target.value))} style={{ width: '120px', padding: '8px 8px 8px 24px', textAlign: 'right', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', fontWeight: 500 }} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold', color: 'var(--text-main)', marginTop: '16px', paddingTop: '16px', borderTop: '2px solid var(--border)' }}>
                    <span>Grand Total:</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="drawer-footer" style={{ marginTop: '24px', padding: '20px 24px', borderTop: '1px solid var(--border)', background: 'var(--bg-card)', position: 'sticky', bottom: 0, zIndex: 10, display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
                <button type="button" className="btn-outline" onClick={handleClose} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0} style={{ padding: '12px 32px', fontSize: '15px', background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', border: 'none' }}>
                  {loading ? 'Processing...' : 'Complete Invoice'}
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
