import React from 'react';
import '../inventory/page.css';
import { getPurchaseOrders } from '@/actions/purchase-orders';
import CreatePurchaseOrderModal from '@/components/CreatePurchaseOrderModal';
import SearchBar from '@/components/SearchBar';
import PurchaseOrdersClient from '@/components/PurchaseOrdersClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getSuppliers } from '@/actions/suppliers';
import { getProducts } from '@/actions/inventory';

export const dynamic = 'force-dynamic';

export default async function PurchaseOrdersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const purchaseOrders = await getPurchaseOrders(sp?.search);
  const suppliers = await getSuppliers();
  const products = await getProducts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Purchase Orders</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search POs..." basePath="/purchase-orders" />
          <div className="desktop-only">
            <CreatePurchaseOrderModal suppliers={suppliers} products={products} />
          </div>
        </div>
      </div>

      <PurchaseOrdersClient purchaseOrders={purchaseOrders} isOwner={isOwner} />
    </div>
  );
}
