import React from 'react';

const payments = [
  { id: 1, name: 'M/s Pooja Hydraulics', amount: '₹12,450', dueIn: 'Due in 5 days' },
  { id: 2, name: 'M/s Shakti Engineering', amount: '₹8,750', dueIn: 'Due in 7 days', isLate: true },
  { id: 3, name: 'M/s Ganesh Machine Works', amount: '₹15,200', dueIn: 'Due in 12 days' },
];

export default function DuePayments() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {payments.map(payment => (
        <div key={payment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '13px', fontWeight: 500 }}>{payment.name}</div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 600, fontSize: '14px' }}>{payment.amount}</p>
            <p style={{ fontSize: '11px', color: payment.isLate ? 'var(--danger)' : 'var(--text-muted)' }}>{payment.dueIn}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
