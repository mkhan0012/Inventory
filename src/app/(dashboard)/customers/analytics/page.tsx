import React from 'react';
import { getCustomerAnalytics } from '@/actions/customer-analytics';
import CustomerAnalyticsClient from '@/components/CustomerAnalyticsClient';
import PageTabs from '@/components/PageTabs';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function CustomerAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  if (!isOwner) {
    return (
      <div className="page-container">
        <h1 className="page-title">Access Denied</h1>
        <p>You do not have permission to view customer analytics.</p>
      </div>
    );
  }

  const analyticsData = await getCustomerAnalytics();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
      </div>

      <PageTabs 
        tabs={[
          { name: 'Customer Directory', href: '/customers' },
          { name: 'Customer Intelligence', href: '/customers/analytics' }
        ]} 
      />

      <CustomerAnalyticsClient initialData={analyticsData} />
    </div>
  );
}
