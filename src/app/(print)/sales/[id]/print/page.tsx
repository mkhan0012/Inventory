import React from 'react';
import prisma from '@/lib/prisma';
import { getSettings } from '@/actions/settings';
import PrintButton from '../../../PrintButton';
import '../../../print.css';

export default async function PrintInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      items: { include: { product: true } }
    }
  });

  if (!invoice) return <div>Invoice not found</div>;

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
          <h2>INVOICE</h2>
          <p><strong>Invoice No:</strong> {invoice.invoiceNo}</p>
          <p><strong>Date:</strong> {new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Status:</strong> {invoice.status}</p>
        </div>
      </div>

      <div className="bill-to">
        <h3>Bill To:</h3>
        <p><strong>{invoice.customer.name}</strong></p>
        {invoice.customer.phone && <p>Phone: {invoice.customer.phone}</p>}
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
          {invoice.items.map((item, index) => (
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
          <span>₹{invoice.subtotal.toFixed(2)}</span>
        </div>
        <div className="total-row">
          <span>Tax:</span>
          <span>₹{invoice.tax.toFixed(2)}</span>
        </div>
        <div className="total-row grand-total">
          <span>Grand Total:</span>
          <span>₹{invoice.total.toFixed(2)}</span>
        </div>
      </div>

      <div className="print-footer">
        <div style={{ fontStyle: 'italic', color: '#6b7280' }}>
          <p>Thank you for your business!</p>
        </div>
        <div className="signatory">
          <p>Authorized Signatory</p>
        </div>
      </div>

      <PrintButton />
    </div>
  );
}
