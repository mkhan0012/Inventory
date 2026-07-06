import React from 'react';
import '../inventory/page.css';
import { getCustomers } from '@/actions/customers';
import AddCustomerModal from '@/components/AddCustomerModal';
import SearchBar from '@/components/SearchBar';
import CustomersClient from '@/components/CustomersClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function CustomersPage({
  searchParams,
}: {
  searchParams?: { search?: string }
}) {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';
  
  const customers = await getCustomers(searchParams?.search);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search customers..." basePath="/customers" />
          <div className="desktop-only">
            <AddCustomerModal />
          </div>
        </div>
      </div>

      <CustomersClient customers={customers} isOwner={isOwner} />
    </div>
  );
}
