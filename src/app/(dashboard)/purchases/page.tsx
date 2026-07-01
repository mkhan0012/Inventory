import React from 'react';
import { Search, FileText } from 'lucide-react';
import '../inventory/page.css';
import { getPurchases, deletePurchase } from '@/actions/purchases';
import CreatePurchaseModal from '@/components/CreatePurchaseModal';
import DeleteButton from '@/components/DeleteButton';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getSuppliers } from '@/actions/suppliers';
import { getProducts } from '@/actions/inventory';

export const dynamic = 'force-dynamic';

export default async function PurchasesPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const purchases = await getPurchases();
  const suppliers = await getSuppliers();
  const products = await getProducts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Purchases</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search purchases..." />
          </div>
          <CreatePurchaseModal suppliers={suppliers} products={products} />
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Purchase No</th>
              <th>Date</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No purchases found.</td>
              </tr>
            ) : purchases.map((purchase) => (
              <tr key={purchase.id}>
                <td className="text-primary font-medium">{purchase.purchaseNo}</td>
                <td>{new Date(purchase.date).toLocaleDateString()}</td>
                <td className="font-medium">{purchase.supplier.name}</td>
                <td>{purchase.items.length} items</td>
                <td>₹{purchase.total.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${purchase.status.toLowerCase()}`}>
                    {purchase.status}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button className="btn-icon" title="View Purchase">
                    <FileText size={16} />
                  </button>
                  {isOwner && (
                    <DeleteButton id={purchase.id} action={deletePurchase} itemType="purchase" />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
