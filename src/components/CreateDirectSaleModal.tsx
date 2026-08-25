"use client";
import React, { useState, useEffect } from 'react';
import { Plus, X, Trash2, ScanLine, Zap, Sparkles } from 'lucide-react';
import { createDirectSale, getUpsellSuggestions } from '@/actions/sales';
import toast from 'react-hot-toast';
import './AddProductModal.css';

export default function CreateDirectSaleModal({ products }: { products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [tax, setTax] = useState(0);
  const [date, setDate] = useState('');
  const [items, setItems] = useState<{ productId: string; quantity: number; rate: number }[]>([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [createdSaleId, setCreatedSaleId] = useState<string | null>(null);
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

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Please add at least one valid item.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await createDirectSale({
        items,
        tax,
        date: date ? date : undefined
      });
      
      setCreatedSaleId(res.id);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setCreatedSaleId(null);
    setItems([]);
    setTax(0);
    setDate('');
  };

  return (
    <>
      <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ background: '#f59e0b', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={16} /> Quick Sale
      </button>

      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '850px', background: 'var(--bg-card)' }}>
            <div className="modal-header">
              <h2>{createdSaleId ? 'Success' : 'Advanced Quick Sale'}</h2>
              <button className="close-btn" type="button" onClick={handleClose}><X size={20} /></button>
            </div>
            
            {createdSaleId ? (
              <div style={{ textAlign: 'center', padding: '50px 20px' }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '35px', background: 'var(--success)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)' }}>
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h3 style={{ fontSize: '24px', marginBottom: '10px', color: 'var(--text-main)' }}>Sale Recorded Successfully!</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '15px' }}>Stock has been deducted and revenue logged instantly.</p>
                
                <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                  <button className="btn-outline" onClick={handleClose} style={{ padding: '12px 24px', fontSize: '15px' }}>Close Window</button>
                </div>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date (Optional)</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%' }} />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Quick Add Item (Barcode or Name)</label>
                  <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg-main)', padding: '4px 12px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)' }}>
                     <ScanLine size={18} color="var(--primary)" />
                     <input 
                       type="text" 
                       placeholder="Scan barcode or type exact product name + Enter..." 
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
                             toast.error("Product not found! Try searching manually.");
                           }
                         }
                       }}
                       style={{ border: 'none', background: 'transparent', padding: '12px', color: 'var(--text-main)', width: '100%', outline: 'none', fontSize: '14px' }} 
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
                    <div key={index} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', background: 'var(--bg-main)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}>
                      <div className="form-group" style={{ flex: 2, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Search Product</label>
                        <input 
                          list={`product-list-ds-${index}`} 
                          placeholder="Type to search product..."
                          required
                          value={products.find(p => p.id === item.productId)?.name || item.productId}
                          onChange={e => {
                            const val = e.target.value;
                            const product = products.find(p => p.name === val || p.code === val);
                            if (product) {
                              updateItem(index, 'productId', product.id);
                            } else {
                              updateItem(index, 'productId', val);
                            }
                          }}
                          style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }}
                        />
                        <datalist id={`product-list-ds-${index}`}>
                          {products.map(p => (
                            <option key={p.id} value={p.name}>{p.code} | ₹{p.price} | Stock: {p.stock}</option>
                          ))}
                        </datalist>
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Qty (Units/Meters)</label>
                        <input type="number" required min="0.01" step="0.01" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
                      </div>
                      <div className="form-group" style={{ flex: 1, margin: 0 }}>
                        <label style={{ fontSize: '12px', marginBottom: '4px' }}>Unit Price (₹)</label>
                        <input type="number" required step="0.01" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} style={{ padding: '10px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', width: '100%', fontSize: '13px' }} />
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
                    No items added. <br/> Scan a barcode or click "Add Row" to start billing.
                  </div>
                )}

                {suggestions.length > 0 && (
                  <div style={{ marginTop: '20px', padding: '16px', background: 'var(--primary-glow)', borderRadius: '12px', border: '1px solid rgba(41,98,255,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: 'var(--primary)', fontWeight: 600, fontSize: '14px' }}>
                      <Sparkles size={18} /> Frequently Bought Together
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      {suggestions.map(s => (
                        <button 
                          key={s.id} 
                          type="button"
                          onClick={() => {
                            const newItems = [...items, { productId: s.id, quantity: 1, rate: s.price }];
                            setItems(newItems);
                          }}
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '20px', fontSize: '13px', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: 'var(--shadow-sm)', fontWeight: 500 }}
                        >
                          <Plus size={14} color="var(--primary)" /> {s.name} <span style={{ color: 'var(--text-muted)' }}>| ₹{s.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px' }}>
                  <p style={{ margin: 0 }}>Quick sales deduct stock instantly and log revenue. Ensure amounts are correct before recording.</p>
                </div>
                <div style={{ width: '300px', background: 'var(--bg-main)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                    <span>Subtotal:</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>₹{subtotal.toFixed(2)}</span>
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
              
              <div className="modal-footer" style={{ marginTop: '24px' }}>
                <button type="button" className="btn-outline" onClick={handleClose} style={{ padding: '12px 24px' }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={loading || items.length === 0} style={{ padding: '12px 32px', fontSize: '15px' }}>
                  {loading ? 'Recording...' : 'Record Sale'}
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
