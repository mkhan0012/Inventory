import React from 'react';
import '../inventory/page.css';
import { getPurchases } from '@/actions/purchases';
import CreatePurchaseModal from '@/components/CreatePurchaseModal';
import SearchBar from '@/components/SearchBar';
import PurchasesClient from '@/components/PurchasesClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getSuppliers } from '@/actions/suppliers';
import { getProducts } from '@/actions/inventory';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const purchases = await getPurchases(sp?.search);
  const suppliers = await getSuppliers();
  const products = await getProducts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Purchases</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search purchases..." basePath="/purchases" />
          <div className="desktop-only">
            <CreatePurchaseModal suppliers={suppliers} products={products} />
          </div>
        </div>
      </div>

      <PurchasesClient purchases={purchases} isOwner={isOwner} />
    </div>
  );
}
