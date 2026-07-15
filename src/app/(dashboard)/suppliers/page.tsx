import React from 'react';
import '../inventory/page.css';
import { getSuppliers } from '@/actions/suppliers';
import AddSupplierModal from '@/components/AddSupplierModal';
import SearchBar from '@/components/SearchBar';
import SuppliersClient from '@/components/SuppliersClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const suppliers = await getSuppliers(sp?.search);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Suppliers</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search suppliers..." basePath="/suppliers" />
          <div className="desktop-only">
            <AddSupplierModal />
          </div>
        </div>
      </div>

      <SuppliersClient suppliers={suppliers} isOwner={isOwner} />
    </div>
  );
}
