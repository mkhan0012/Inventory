"use client";
import React, { useState } from 'react';
import { Plus, X, Trash2, Send, Sparkles, FileText } from 'lucide-react';
import { createInvoice } from '@/actions/sales';
import { askAI } from '@/actions/ai';
import toast from 'react-hot-toast';
import './SmartBilling.css';

export default function CreateInvoiceModal({ customers, products }: { customers: any[], products: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCommand, setAiCommand] = useState('');
  
  const [customerId, setCustomerId] = useState('');
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
    const toastId = toast.loading("AI is generating your invoice...");
    try {
      const result = await askAI(`I want to create an invoice. Command: "${aiCommand}". Please use the create_invoice_ai tool.`);
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
    if (!customerId || items.length === 0 || items.some(i => !i.productId)) {
      toast.error("Add at least one valid item and select a customer.");
      return;
    }
    setLoading(true);
    try {
      await createInvoice({ customerId, items, tax: 0, status: 'PAID' });
      toast.success("Invoice created successfully!");
      setIsOpen(false);
      setItems([]);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="smart-billing-wrapper" style={{ right: '400px' }}>
      {isOpen && (
        <div className="smart-billing-panel">
          <div className="smart-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#8b5cf6" />
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Invoice Copilot</h3>
            </div>
            <button className="btn-icon" onClick={() => setIsOpen(false)} style={{ background: 'transparent' }}><X size={20} /></button>
          </div>

          <form onSubmit={handleAiSubmit} className="ai-command-box">
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b5cf6', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Sparkles size={14} className="pulse-anim" /> AI INVOICE GENERATOR
            </label>
            <div className="ai-input-wrapper">
              <input 
                type="text" 
                placeholder="e.g., 'Invoice John Doe for 2 filters'" 
                value={aiCommand}
                onChange={e => setAiCommand(e.target.value)}
                disabled={aiLoading}
              />
              <button type="submit" className="ai-submit-btn" disabled={aiLoading || !aiCommand.trim()}>
                <Send size={16} />
              </button>
            </div>
          </form>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div className="smart-panel-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>MANUAL ENTRY</span>
                <button type="button" onClick={addItem} style={{ background: 'transparent', border: 'none', color: '#8b5cf6', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Plus size={14} /> Add Row
                </button>
              </div>

              <div className="compact-item-row" style={{ gridTemplateColumns: '1fr' }}>
                <input 
                  list="customers-list-ai" 
                  required 
                  placeholder="Select Customer..."
                  value={customers.find(c => c.id === customerId)?.name || customerId}
                  onChange={e => {
                    const match = customers.find(c => c.name === e.target.value);
                    if (match) setCustomerId(match.id);
                    else setCustomerId(e.target.value);
                  }} 
                  style={{ width: '100%' }}
                />
                <datalist id="customers-list-ai">
                  {customers.map(c => (
                    <option key={c.id} value={c.name}>{c.phone}</option>
                  ))}
                </datalist>
              </div>

              {items.map((item, index) => (
                <div key={index} className="compact-item-row">
                  <input 
                    list={`product-list-inv-${index}`} 
                    placeholder="Search product..."
                    required
                    value={products.find(p => p.id === item.productId)?.name || item.productId}
                    onChange={e => {
                      const val = e.target.value;
                      const product = products.find(p => p.name === val || p.code === val);
                      updateItem(index, 'productId', product ? product.id : val);
                    }}
                  />
                  <datalist id={`product-list-inv-${index}`}>
                    {products.map(p => <option key={p.id} value={p.name}>{p.code} | ₹{p.price}</option>)}
                  </datalist>
                  <input type="number" required min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(index, 'quantity', e.target.value)} />
                  <input type="number" required step="0.01" placeholder="Rate" value={item.rate} onChange={e => updateItem(index, 'rate', e.target.value)} />
                  <button type="button" onClick={() => removeItem(index)} style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '4px' }}><Trash2 size={16} /></button>
                </div>
              ))}
              
              {items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  Click "Add Row" to start adding items manually.
                </div>
              )}
            </div>

            <div className="smart-panel-footer">
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginRight: '8px', fontWeight: 500 }}>TOTAL</span>
                ₹{subtotal.toFixed(2)}
              </div>
              <button type="submit" disabled={loading || items.length === 0} style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #8b5cf6 100%)', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '12px', fontWeight: 600, cursor: (loading || items.length === 0) ? 'not-allowed' : 'pointer', opacity: (loading || items.length === 0) ? 0.5 : 1 }}>
                {loading ? 'Saving...' : 'Create Invoice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {!isOpen && (
        <button className="smart-billing-trigger" onClick={() => setIsOpen(true)}>
          <Sparkles size={20} /> <span style={{ marginRight: '8px' }}>Smart Invoice</span>
        </button>
      )}
    </div>
  );
}
