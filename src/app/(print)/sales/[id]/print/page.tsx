import React from 'react';
import prisma from '@/lib/prisma';
import { getSettings } from '@/actions/settings';
import PrintButton from '../../../PrintButton';
import '../../../print.css';
import { MessageCircle } from 'lucide-react';

// Simple number to words function (Indian numbering system)
function numberToWords(num: number): string {
  if (num === 0) return 'Zero Only';
  const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  if ((num = num.toString()).length > 9) return 'overflow';
  const n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return '';
  let str = '';
  str += (Number(n[1]) !== 0) ? (a[Number(n[1])] || b[Number(n[1][0])] + ' ' + a[Number(n[1][1])]) + 'Crore ' : '';
  str += (Number(n[2]) !== 0) ? (a[Number(n[2])] || b[Number(n[2][0])] + ' ' + a[Number(n[2][1])]) + 'Lakh ' : '';
  str += (Number(n[3]) !== 0) ? (a[Number(n[3])] || b[Number(n[3][0])] + ' ' + a[Number(n[3][1])]) + 'Thousand ' : '';
  str += (Number(n[4]) !== 0) ? (a[Number(n[4])] || b[Number(n[4][0])] + ' ' + a[Number(n[4][1])]) + 'Hundred ' : '';
  str += (Number(n[5]) !== 0) ? ((str !== '') ? 'and ' : '') + (a[Number(n[5])] || b[Number(n[5][0])] + ' ' + a[Number(n[5][1])]) + 'Only' : 'Only';
  return str;
}

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
  
  const whatsappText = encodeURIComponent(`Hello ${invoice.customer.name},\n\nYour invoice *${invoice.invoiceNo}* for *₹${invoice.total.toFixed(2)}* has been generated.\n\nThank you for your business!`);
  const whatsappUrl = `https://wa.me/?text=${whatsappText}`;

  return (
    <div className="print-wrapper">
      <div className="print-container">
        {/* Watermark Logo */}
        <img src="/logo.png" alt="" className="invoice-watermark" />
        
        <div className="print-content">
          <div className="print-header">
            <div className="company-details">
              <img src="/logo.png" alt="Company Logo" className="company-logo" />
              <div>
                <h1 className="shop-name">{settings.shopName}</h1>
                <p className="shop-address">{settings.address}</p>
                <p className="shop-gst">GSTIN: {settings.gstNumber}</p>
              </div>
            </div>
            <div className="invoice-meta">
              <h2 className="invoice-title">INVOICE</h2>
              <div className="meta-grid">
                <span className="meta-label">Invoice No:</span>
                <span className="meta-value">{invoice.invoiceNo}</span>
                <span className="meta-label">Date:</span>
                <span className="meta-value">{new Date(invoice.date).toLocaleDateString('en-IN')}</span>
                <span className="meta-label">Status:</span>
                <span className="meta-value">{invoice.status}</span>
              </div>
            </div>
          </div>

          <div className="info-section">
            <div className="bill-to">
              <h3>Bill To:</h3>
              <p className="customer-name">{invoice.customer.name}</p>
              {invoice.customer.phone && <p className="customer-phone">Phone: {invoice.customer.phone}</p>}
            </div>
          </div>

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
              {invoice.items.map((item, index) => (
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

          <div className="summary-section">
            <div className="amount-in-words">
              <h4>Amount in Words:</h4>
              <p>Rupees {numberToWords(Math.round(invoice.total))}</p>
            </div>
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
          </div>

          <div className="print-footer">
            <div className="terms-section">
              <h4>Terms & Conditions</h4>
              <ul>
                <li>Goods once sold will not be taken back.</li>
                <li>Interest @ 18% p.a. will be charged if payment is delayed.</li>
                <li>Subject to local jurisdiction only.</li>
              </ul>
            </div>
            <div className="signatory">
              <div className="signature-line">
                Authorized Signatory
              </div>
            </div>
          </div>

          <div className="actions-bar no-print">
            <a href={whatsappUrl} target="_blank" rel="noreferrer" className="action-btn whatsapp-btn">
              <MessageCircle size={18} /> Share on WhatsApp
            </a>
            <PrintButton />
          </div>
        </div>
      </div>
    </div>
  );
}
