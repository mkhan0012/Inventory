"use client";
import React, { useState } from 'react';
import { Package, Search, Plus } from 'lucide-react';
import ProcessReturnModal from './ProcessReturnModal';

export default function ReturnsClient({ initialReturns, customers, products }: { initialReturns: any[], customers: any[], products: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = initialReturns.filter(ret => 
    ret.returnNo.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (ret.customer?.name && ret.customer.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Returns</h1>
          <p className="page-subtitle">Process returns, refund amounts, and update inventory seamlessly.</p>
        </div>
        <div className="page-actions">
          <div className="search-bar">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search return No or customer..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ProcessReturnModal customers={customers} products={products} />
        </div>
      </div>

      <div className="table-card">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Return No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Reason</th>
                <th className="text-right">Total Refund (₹)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map(ret => (
                <React.Fragment key={ret.id}>
                  <tr 
                    onClick={() => setExpandedId(expandedId === ret.id ? null : ret.id)} 
                    style={{ cursor: 'pointer', background: expandedId === ret.id ? 'var(--bg-main)' : 'inherit' }}
                  >
                    <td>
                      <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                        {ret.returnNo}
                      </span>
                    </td>
                    <td>{new Date(ret.date).toLocaleDateString('en-IN')}</td>
                    <td>{ret.customer?.name || 'Walk-in'}</td>
                    <td>{ret.reason || 'N/A'}</td>
                    <td className="text-right fw-bold text-danger">-₹{ret.totalAmount.toFixed(2)}</td>
                  </tr>
                  {expandedId === ret.id && (
                    <tr>
                      <td colSpan={5} style={{ padding: '0', borderBottom: '1px solid var(--border)' }}>
                        <div style={{ padding: '16px 24px', background: 'var(--bg-card)' }}>
                          <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>Returned Items Detail</h4>
                          <table style={{ width: '100%', fontSize: '13px', background: 'var(--bg-main)', borderRadius: '8px', overflow: 'hidden' }}>
                            <thead style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                              <tr>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Qty Returned</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Refund Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ret.items.map((item: any) => (
                                <tr key={item.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                  <td style={{ padding: '10px' }}>{item.product?.name || 'Unknown'}</td>
                                  <td style={{ padding: '10px', textAlign: 'center' }}>{item.quantity}</td>
                                  <td style={{ padding: '10px', textAlign: 'right', color: 'var(--danger)' }}>-₹{item.refundAmount.toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )) : (
                <tr>
                  <td colSpan={5} className="text-center text-muted py-4">No returns found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
