import React from 'react';
import prisma from '@/lib/prisma';
import { getSettings } from '@/actions/settings';
import PrintButton from '../../../PrintButton';
import '../../../print.css';

export default async function PrintPurchase({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const purchase = await prisma.purchase.findUnique({
    where: { id },
    include: {
      supplier: true,
      items: { include: { product: true } }
    }
  });

  if (!purchase) return <div>Purchase record not found</div>;

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
          <h2>PURCHASE ORDER</h2>
          <p><strong>Purchase No:</strong> {purchase.purchaseNo}</p>
          <p><strong>Date:</strong> {new Date(purchase.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {purchase.status}</p>
        </div>
      </div>

      <div className="bill-to">
        <h3>Supplier:</h3>
        <p><strong>{purchase.supplier.name}</strong></p>
        {purchase.supplier.phone && <p>Phone: {purchase.supplier.phone}</p>}
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
          {purchase.items.map((item, index) => (
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
          <span>₹{purchase.subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Tax:</span>
          <span>₹{purchase.tax.toFixed(2)}</span>
        </div>
        <div className="total-row grand-total">
          <span>Grand Total:</span>
          <span>₹{purchase.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="print-footer">
        <div style={{ fontStyle: 'italic', color: '#6b7280' }}>
          <p>Thank you for supplying to us!</p>
        </div>
        <div className="signatory">
          <p>Authorized Signatory</p>
        </div>
      </div>

      <PrintButton />
    </div>
  );
}
