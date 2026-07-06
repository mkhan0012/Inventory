import React from 'react';
import '../inventory/page.css';
import { getExpenses } from '@/actions/expenses';
import AddExpenseModal from '@/components/AddExpenseModal';
import SearchBar from '@/components/SearchBar';
import ExpensesClient from '@/components/ExpensesClient';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export const dynamic = 'force-dynamic';

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams?: { search?: string }
}) {
  const session = await getServerSession(authOptions);
  const isOwner = (session?.user as any)?.role === 'OWNER';

  const expenses = await getExpenses(searchParams?.search);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <div className="header-actions">
          <SearchBar placeholder="Search expenses..." basePath="/expenses" />
          <AddExpenseModal />
        </div>
      </div>

      <ExpensesClient expenses={expenses} isOwner={isOwner} />
    </div>
  );
}
