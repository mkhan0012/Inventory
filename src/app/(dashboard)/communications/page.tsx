import React from 'react';
import { MessageCircle, AlertCircle, Clock, Send } from 'lucide-react';
import { getCommunicationData } from '@/actions/communications';
import '../inventory/page.css';

export const dynamic = 'force-dynamic';

export default async function CommunicationsPage() {
  const { dueCustomers, missingCustomers } = await getCommunicationData();

  const formatWhatsAppNumber = (phone: string | null) => {
    if (!phone) return '';
    // Strip non-digits
    let cleaned = phone.replace(/\D/g, '');
    // If it's a 10 digit Indian number, add 91
    if (cleaned.length === 10) {
      cleaned = '91' + cleaned;
    }
    return cleaned;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Automated WhatsApp Communications</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Pending Collections */}
        <div className="card" style={{ padding: '24px', borderTop: '4px solid #ef4444' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <AlertCircle color="#ef4444" size={24} />
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)' }}>Pending Collections</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Customers with unpaid balances. Click the button to send a polite payment reminder via WhatsApp.
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Due Amount</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dueCustomers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No pending dues! 🎉</td>
                </tr>
              ) : dueCustomers.map(c => {
                const waNum = formatWhatsAppNumber(c.phone);
                const message = encodeURIComponent(`Hello ${c.name},\nThis is a polite reminder from Bharat Hydraulics that you have a pending balance of ₹${c.dueAmount.toFixed(2)}. Please arrange the payment at your earliest convenience. Thank you!`);
                const waLink = waNum ? `https://wa.me/${waNum}?text=${message}` : null;
                
                return (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td style={{ color: '#ef4444', fontWeight: 'bold' }}>₹{c.dueAmount.toFixed(2)}</td>
                    <td>
                      {waLink ? (
                        <a href={waLink} target="_blank" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}>
                          <Send size={14} /> Send WhatsApp
                        </a>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Phone Number</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Missing Clients Follow-ups */}
        <div className="card" style={{ padding: '24px', borderTop: '4px solid #2962ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
            <Clock color="#2962ff" size={24} />
            <h2 style={{ fontSize: '18px', margin: 0, color: 'var(--text-main)' }}>Missing Client Follow-ups</h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>
            Customers who have purchased before, but haven't bought anything in the last 15 days. Send a check-in message!
          </p>

          <table className="data-table">
            <thead>
              <tr>
                <th>Customer Name</th>
                <th>Total Past Purchases</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {missingCustomers.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No missing regular clients! 👍</td>
                </tr>
              ) : missingCustomers.slice(0, 15).map(c => {
                const waNum = formatWhatsAppNumber(c.phone);
                const message = encodeURIComponent(`Hello ${c.name},\nIt has been a while since we saw you at Bharat Hydraulics. We hope your work is going well! Let us know if you need any supplies or hydraulic services. Have a great day!`);
                const waLink = waNum ? `https://wa.me/${waNum}?text=${message}` : null;
                
                return (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td style={{ color: '#2962ff', fontWeight: 'bold' }}>₹{c.totalPurchases.toFixed(2)}</td>
                    <td>
                      {waLink ? (
                        <a href={waLink} target="_blank" className="btn-primary" style={{ padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', textDecoration: 'none', background: '#2962ff' }}>
                          <MessageCircle size={14} /> Follow-up
                        </a>
                      ) : (
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No Phone Number</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
