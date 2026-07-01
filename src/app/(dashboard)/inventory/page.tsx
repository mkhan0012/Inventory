import React from 'react';
import { Search, Filter } from 'lucide-react';
import './page.css';
import { getProducts, deleteProduct } from '@/actions/inventory';
import AddProductModal from '@/components/AddProductModal';
import DeleteButton from '@/components/DeleteButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: { search?: string }
}) {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  const inventoryData = await getProducts(searchParams?.search);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search items..." />
          </div>
          <button className="btn-outline">
            <Filter size={16} /> Filter
          </button>
          <div className="desktop-only">
            <AddProductModal />
          </div>
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Location</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Est. Empty</th>
              <th>Status</th>
              {isOwner && <th className="desktop-only">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {inventoryData.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No items found.</td>
              </tr>
            ) : inventoryData.map((item) => (
              <tr key={item.id}>
                <td className="text-primary font-medium">{item.code}</td>
                <td className="font-medium">{item.name}</td>
                <td>{item.category}</td>
                <td style={{ fontWeight: 'bold' }}>{item.stock}</td>
                <td>
                  <span style={{ fontSize: '11px', background: 'var(--bg-main)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border)' }}>
                    {item.location}
                  </span>
                </td>
                <td>{item.unit}</td>
                <td>₹{item.price.toFixed(2)}</td>
                <td>
                  {item.daysUntilEmpty === -1 ? (
                    <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Insufficient Data</span>
                  ) : item.daysUntilEmpty <= 7 ? (
                    <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{item.daysUntilEmpty} Days ⚠️</span>
                  ) : (
                    <span style={{ color: '#10b981' }}>{item.daysUntilEmpty} Days</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${item.status.replace(/ /g, '-').toLowerCase()}`}>
                    {item.status}
                  </span>
                </td>
                {isOwner && (
                  <td className="desktop-only">
                    <DeleteButton id={item.id} action={deleteProduct} itemType="product" />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
