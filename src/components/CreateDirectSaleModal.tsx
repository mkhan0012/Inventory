"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2, Zap, Send, Sparkles } from 'lucide-react';
import { createDirectSale } from '@/actions/sales';
import { askAI } from '@/actions/ai';
import toast from 'react-hot-toast';
import './SmartBilling.css';

export default function CreateDirectSaleModal({ products }: { products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  
  const [items, setItems] = useState<{ productId: string; quantity: number; rate: number }[]>([]);

  const addItem = () => setItems([...items, { productId: '', quantity: 1, rate: 0 }]);
  
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
  
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiCommand.trim()) return;
    setAiLoading(true);
    const toastId = toast.loading("AI is generating your sale...");
    try {
      const result = await askAI(`I want to record a direct cash sale. Command: "${aiCommand}". Please use the create_direct_sale tool.`);
      toast.success(result, { id: toastId });
      setAiCommand('');
      setIsOpen(false);
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
    setAiLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Add at least one valid item.");
      return;
    }
    setLoading(true);
    try {
      await createDirectSale({ items, tax: 0 });
      toast.success("Quick sale recorded!");
      setIsOpen(false);
      setItems([]);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="smart-billing-wrapper" style={{ right: '220px' }}>
      {isOpen && (
        <div className="smart-billing-panel">
          <div className="smart-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Zap size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Quick Sale Copilot</h3>
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)} style={{ background: 'transparent' }}><X size={20} /></button>
          </div>

          <form onSubmit={handleAiSubmit} className="ai-command-box orange">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#d97706', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} className="pulse-anim" /> AI SALE GENERATOR
            </label>
            <div className="ai-input-wrapper orange">
              <input 
                type="text" 
                placeholder="e.g., 'Sold 2 hydraulic pumps and 5 pipes'" 
                value={aiCommand}
                onChange={e => setAiCommand(e.target.value)}
                disabled={aiLoading}
              />
              <button type="submit" className="ai-submit-btn orange" disabled={aiLoading || !aiCommand.trim()}>
                <Send size={16} />
              </button>
            </div>
          </form>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="smart-panel-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>MANUAL ENTRY</span>
                <button type="button" onClick={addItem} style={{ background: 'transparent', border: 'none', color: '#f59e0b', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="compact-item-row">
                  <input 
                    list={`product-list-ds-${index}`} 
                    placeholder="Search product..."
                    required
                    value={products.find(p => p.id === item.productId)?.name || item.productId}
                    onChange={e => {
                      const val = e.target.value;
                      const product = products.find(p => p.name === val || p.code === val);
                      updateItem(index, 'productId', product ? product.id : val);
                    }}
                  />
                  <datalist id={`product-list-ds-${index}`}>
                    {products.map(p => <option key={p.id} value={p.name}>{p.code} | ₹{p.price}</option>)}
                  </datalist>
                  <input type="number" required min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                  <input type="number" required step="0.01" placeholder="Rate" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} />
                  <button type="button" onClick={() => removeItem(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                </div>
              ))}
              
              {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Or type manually. Click "Add Row" to start.
                </div>
              )}
            </div>

            <div className="smart-panel-footer">
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px', fontWeight: 500 }}>TOTAL</span>
                ₹{subtotal.toFixed(2)}
              </div>
              <button type="submit" disabled={loading || items.length === 0} style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 600, cursor: (loading || items.length === 0) ? 'not-allowed' : 'pointer', opacity: (loading || items.length === 0) ? 0.5 : 1 }}>
                {loading ? 'Saving...' : 'Record Sale'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="smart-billing-trigger orange" onClick={() => setIsOpen(true)}>
          <Zap size={20} /> <span style={{ marginRight: '8px' }}>Quick Sale</span>
        </button>
      )}
    </div>
  );
}
