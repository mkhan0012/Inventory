import React from 'react';
import { getInventoryHealth } from '@/actions/inventory-analytics';
import InventoryHealthClient from '@/components/InventoryHealthClient';
import PageTabs from '@/components/PageTabs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function InventoryHealthPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  if (!isOwner) {
    return (
      <div className="page-container">
        <h1 className="page-title">Access Denied</h1>
        <p>You do not have permission to view inventory analytics.</p>
      </div>
    );
  }

  const analyticsData = await getInventoryHealth();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Inventory</h1>
      </div>

      <PageTabs 
        tabs={[
          { name: 'Stock List', href: '/inventory' },
          { name: 'Inventory Health', href: '/inventory/health' }
        ]} 
      />

      <InventoryHealthClient initialData={analyticsData} />
    </div>
  );
}
