import React from 'react';
import { getSupplierAnalytics } from '@/actions/supplier-analytics';
import SupplierAnalyticsClient from '@/components/SupplierAnalyticsClient';
import PageTabs from '@/components/PageTabs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function SupplierAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  if (!isOwner) {
    return (
      <div className="page-container">
        <h1 className="page-title">Access Denied</h1>
        <p>You do not have permission to view supplier analytics.</p>
      </div>
    );
  }

  const analyticsData = await getSupplierAnalytics();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
      </div>

      <PageTabs 
        tabs={[
          { name: 'Supplier Directory', href: '/suppliers' },
          { name: 'Supplier Analytics', href: '/suppliers/analytics' }
        ]} 
      />

      <SupplierAnalyticsClient initialData={analyticsData} />
    </div>
  );
}
