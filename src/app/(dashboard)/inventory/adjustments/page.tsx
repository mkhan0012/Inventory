import React from 'react';
import '../../page.css'; // Uses inventory/page.css
import { getStockAdjustments } from '@/actions/stock-adjustments';
import CreateStockAdjustmentModal from '@/components/CreateStockAdjustmentModal';
import SearchBar from '@/components/SearchBar';
import StockAdjustmentsClient from '@/components/StockAdjustmentsClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { getProducts } from '@/actions/inventory';

export const dynamic = 'force-dynamic';

export default async function StockAdjustmentsPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const sp = await searchParams;
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const adjustments = await getStockAdjustments(sp?.search);
  const products = await getProducts();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Stock Adjustments</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search adjustments..." basePath="/inventory/adjustments" />
          <div className="desktop-only">
            <CreateStockAdjustmentModal products={products} />
          </div>
        </div>
      </div>

      <StockAdjustmentsClient adjustments={adjustments} isOwner={isOwner} />
    </div>
  );
}
