import React from 'react';

const sales = [
  { id: 'INV-0287', customer: 'M/s Shakti Engineering', amount: '₹5,850', date: '28 Jun 2025' },
  { id: 'INV-0286', customer: 'M/s Pooja Hydraulics', amount: '₹3,250', date: '28 Jun 2025' },
  { id: 'INV-0285', customer: 'M/s Ganesh Machine Works', amount: '₹7,450', date: '27 Jun 2025' },
];

export default function RecentSales() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {sales.map(sale => (
        <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '13px' }}>{sale.id}</p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sale.date}</p>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{sale.customer}</div>
          <div style={{ fontWeight: 600, fontSize: '14px' }}>{sale.amount}</div>
        </div>
      ))}
    </div>
  );
}
