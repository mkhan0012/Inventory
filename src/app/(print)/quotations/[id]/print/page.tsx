import React from 'react';
import prisma from '@/lib/prisma';
import { getSettings } from '@/actions/settings';
import PrintButton from '../../../PrintButton';
import '../../../print.css';

export default async function PrintQuotation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quotation = await prisma.quotation.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });

  if (!quotation) return <div>Quotation not found</div>;

  const settings = await getSettings();

  return (
    <div className="print-container">
      <div className="print-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <img src="/logo.png" alt="Bharat Hydraulics" style={{ width: '150px', height: 'auto' }} />
          <div>
            <h1 className="shop-name">{settings.shopName}</h1>
            <p className="shop-address">{settings.address}</p>
            <p className="shop-gst">GSTIN: {settings.gstNumber}</p>
          </div>
        </div>
        <div className="invoice-meta">
          <h2>ESTIMATE / QUOTATION</h2>
          <p><strong>Estimate No:</strong> {quotation.quoteNo}</p>
          <p><strong>Date:</strong> {new Date(quotation.date).toLocaleDateString()}</p>
        </div>
      </div>

      <div className="bill-to">
        <h3>Estimate For:</h3>
        <p><strong>{quotation.customer.name}</strong></p>
        {quotation.customer.phone && <p>Phone: {quotation.customer.phone}</p>}
      </div>

      <table className="print-table">
        <thead>
          <tr>
            <th>S.No</th>
            <th>Item Description</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {quotation.items.map((item, index) => (
            <tr key={item.id}>
              <td>{index + 1}</td>
              <td>{item.product.name}</td>
              <td>{item.quantity}</td>
              <td>₹{item.rate.toFixed(2)}</td>
              <td>₹{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="print-totals">
        <div className="total-row">
          <span>Subtotal:</span>
          <span>₹{quotation.subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Tax:</span>
          <span>₹{quotation.tax.toFixed(2)}</span>
        </div>
        <div className="total-row grand-total">
          <span>Grand Total:</span>
          <span>₹{quotation.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="print-footer">
        <p>This is an estimate, not a tax invoice.</p>
        <p>Authorized Signatory</p>
      </div>

      <PrintButton />
    </div>
  );
}
