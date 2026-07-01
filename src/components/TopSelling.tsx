import React from 'react';
import './TopSelling.css';

const products = [
  { id: 1, name: 'Hydraulic Hose Pipe', stock: '950 PCS', sales: '₹1,45,250', image: 'https://placehold.co/40x40/f4f6f8/2962ff?text=HP' },
  { id: 2, name: 'Steel Fittings', stock: '750 PCS', sales: '₹98,750', image: 'https://placehold.co/40x40/f4f6f8/10b981?text=SF' },
  { id: 3, name: 'Quick Release Coupling', stock: '560 PCS', sales: '₹65,400', image: 'https://placehold.co/40x40/f4f6f8/f59e0b?text=QC' },
  { id: 4, name: 'Hydraulic Adapters', stock: '480 PCS', sales: '₹48,600', image: 'https://placehold.co/40x40/f4f6f8/ef4444?text=HA' },
];

export default function TopSelling() {
  return (
    <div className="top-selling-list">
      {products.map(product => (
        <div key={product.id} className="ts-item">
          <div className="ts-info">
            <img src={product.image} alt={product.name} className="ts-img" />
            <div>
              <p className="ts-name">{product.name}</p>
              <p className="ts-stock">{product.stock}</p>
            </div>
          </div>
          <div className="ts-sales">{product.sales}</div>
        </div>
      ))}
    </div>
  );
}
