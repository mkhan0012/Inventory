import React from 'react';

const purchases = [
  { id: 'PUR-0145', supplier: 'Jain Hydraulics Pvt. Ltd.', amount: '₹23,500', date: '28 Jun 2025' },
  { id: 'PUR-0144', supplier: 'Shree Ram Traders', amount: '₹18,750', date: '26 Jun 2025' },
  { id: 'PUR-0143', supplier: 'Hydro Seal India', amount: '₹12,400', date: '25 Jun 2025' },
];

export default function RecentPurchases() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {purchases.map(purchase => (
        <div key={purchase.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>{purchase.id}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{purchase.date}</p>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{purchase.supplier}</div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{purchase.amount}</div>
        </div>
      ))}
    </div>
  );
}
