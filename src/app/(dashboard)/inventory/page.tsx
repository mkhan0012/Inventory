import React from 'react';
import './page.css';
import { getProducts } from '@/actions/inventory';
import AddProductModal from '@/components/AddProductModal';
import InventorySearch from '@/components/InventorySearch';
import InventoryClient from '@/components/InventoryClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import PageTabs from '@/components/PageTabs';
import { getInventoryAnalytics } from '@/actions/inventory-analytics';

export const dynamic = 'force-dynamic';

export default async function InventoryPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string, filter?: string }>
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  const inventoryData = await getProducts(sp?.search);
  const analyticsData = await getInventoryAnalytics();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
        <div className="header-actions">
          <InventorySearch />
          <div className="desktop-only">
            <AddProductModal />
          </div>
        </div>
      </div>
      
      <PageTabs 
        tabs={[
          { name: 'Stock List', href: '/inventory' },
          { name: 'Inventory Health', href: '/inventory/health' }
        ]} 
      />

      <InventoryClient inventoryData={inventoryData} isOwner={isOwner} analyticsData={analyticsData} />
    </div>
  );
}
