import React from 'react';
import { Search } from 'lucide-react';
import '../inventory/page.css';
import { getExpenses } from '@/actions/expenses';
import AddExpenseModal from '@/components/AddExpenseModal';

export const dynamic = 'force-dynamic';

export default async function ExpensesPage() {
  const expenses = await getExpenses();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Expenses</h1>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} color="var(--text-muted)" />
            <input type="text" placeholder="Search expenses..." />
          </div>
          <AddExpenseModal />
        </div>
      </div>

      <div className="card table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Category</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No expenses logged yet.</td>
              </tr>
            ) : expenses.map((expense) => (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td className="font-medium">{expense.category}</td>
                <td>{expense.description}</td>
                <td className="text-primary font-medium">₹{expense.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
