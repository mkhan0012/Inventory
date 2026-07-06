import React from 'react';
import './page.css';
import { getProducts } from '@/actions/inventory';
import AddProductModal from '@/components/AddProductModal';
import InventorySearch from '@/components/InventorySearch';
import InventoryClient from '@/components/InventoryClient';
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
          <InventorySearch />
          <div className="desktop-only">
            <AddProductModal />
          </div>
        </div>
      </div>
      
      <InventoryClient inventoryData={inventoryData} isOwner={isOwner} />
    </div>
  );
}
