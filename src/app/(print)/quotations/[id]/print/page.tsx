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
    <div className="print-wrapper">
      <div className="print-container">
        {/* Watermark Logo */}
        <img src="/logo.png" alt="" className="invoice-watermark" />
        
        <div className="print-content">
          <div className="print-header-block">
            <div className="company-details">
              <img src="/logo.png" alt="Company Logo" className="company-logo" />
              <div>
                <h1 className="shop-name">{settings.shopName}</h1>
                <p className="shop-address">{settings.address}</p>
                <p className="shop-gst">GSTIN: {settings.gstNumber}</p>
              </div>
            </div>
            <div className="invoice-meta">
              <h2 className="invoice-title" style={{ fontSize: '32px' }}>QUOTATION</h2>
              <div className="meta-grid">
                <span className="meta-label">Quote No:</span>
                <span className="meta-value">{quotation.quoteNo}</span>
                <span className="meta-label">Date:</span>
                <span className="meta-value">{new Date(quotation.date).toLocaleDateString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="bill-to">
              <h3>Estimate For:</h3>
              <p className="customer-name">{quotation.customer.name}</p>
              {quotation.customer.phone && <p className="customer-phone">Phone: {quotation.customer.phone}</p>}
            </div>
          </div>

          <div className="table-wrapper">
            <table className="print-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Item Description</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Rate</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {quotation.items.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.product.name}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">₹{item.rate.toFixed(2)}</td>
                    <td className="text-right">₹{item.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="summary-section" style={{ justifyContent: 'flex-end' }}>
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
          </div>

          <div className="print-footer">
            <div className="terms-section">
              <h4>Note</h4>
              <ul>
                <li>This is an estimate, not a tax invoice.</li>
              </ul>
            </div>
            <div className="signatory">
              <div className="signature-line">
                Authorized Signatory
              </div>
            </div>
          </div>

          <div className="actions-bar no-print">
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
}
