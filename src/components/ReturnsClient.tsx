"use client";
import React, { useState } from 'react';
import { Package, Search, Plus } from 'lucide-react';
import ProcessReturnModal from './ProcessReturnModal';

export default function ReturnsClient({ initialReturns, customers, products }: { initialReturns: any[], customers: any[], products: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');

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
                <tr key={ret.id}>
                  <td><span className="badge badge-success">{ret.returnNo}</span></td>
                  <td>{new Date(ret.date).toLocaleDateString('en-IN')}</td>
                  <td>{ret.customer?.name || 'Walk-in'}</td>
                  <td>{ret.reason || 'N/A'}</td>
                  <td className="text-right fw-bold text-danger">-₹{ret.totalAmount.toFixed(2)}</td>
                </tr>
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
