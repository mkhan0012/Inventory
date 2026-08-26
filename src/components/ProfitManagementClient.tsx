"use client";

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Trash2, 
  TrendingDown, 
  Wallet, 
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
  IndianRupee
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend
} from 'recharts';
import { addProfitAllocation, deleteProfitAllocation } from '@/actions/profit-allocation';
import toast from 'react-hot-toast';
import './ProfitManagement.css';

interface Allocation {
  id: string;
  month: Date;
  description: string;
  amount: number;
  date: Date;
}

interface Props {
  initialMonth: number;
  initialYear: number;
  profit: number;
  allocations: Allocation[];
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

export default function ProfitManagementClient({ initialMonth, initialYear, profit, allocations }: Props) {
  const router = useRouter();
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');

  const totalSpent = allocations.reduce((acc, curr) => acc + curr.amount, 0);
  const remaining = profit - totalSpent;
  const isNegative = remaining < 0;

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    router.push(`/profit-management?month=${newMonth}&year=${newYear}`);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    router.push(`/profit-management?month=${newMonth}&year=${newYear}`);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc.trim() || !amount) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      await addProfitAllocation({
        year,
        month,
        description: desc,
        amount: parseFloat(amount)
      });
      toast.success("Added successfully");
      setDesc('');
      setAmount('');
      router.refresh();
    } catch (error) {
      toast.error("Failed to add allocation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this?")) return;
    try {
      await deleteProfitAllocation(id);
      toast.success("Deleted");
      router.refresh();
    } catch (error) {
      toast.error("Failed to delete");
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(val);
  };

  const pieData = useMemo(() => {
    let data = allocations.map(a => ({ name: a.description, value: a.amount }));
    if (!isNegative && remaining > 0) {
      data.push({ name: 'Remaining Profit', value: remaining });
    }
    return data;
  }, [allocations, remaining, isNegative]);

  const barData = [
    {
      name: 'Profit Analysis',
      'Total Profit': profit,
      'Total Spent': totalSpent,
    }
  ];

  return (
    <div className="pm-container">
      <div className="pm-header">
        <div className="pm-header-content">
          <h1 className="pm-title">Profit Allocation & Analysis</h1>
          <p className="pm-subtitle">Track how you spend your monthly profits</p>
        </div>
        
        <div className="pm-month-selector">
          <button onClick={handlePrevMonth} className="pm-icon-btn"><ChevronLeft size={20}/></button>
          <span className="pm-month-label">{MONTHS[month]} {year}</span>
          <button onClick={handleNextMonth} className="pm-icon-btn"><ChevronRight size={20}/></button>
        </div>
      </div>

      <div className="pm-stats-grid">
        <div className="pm-stat-card">
          <div className="pm-stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
            <Wallet size={32} />
          </div>
          <div className="pm-stat-details">
            <h3>Total Profit</h3>
            <p className="pm-stat-value">{formatCurrency(profit)}</p>
          </div>
        </div>

        <div className="pm-stat-card">
          <div className="pm-stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
            <TrendingDown size={32} />
          </div>
          <div className="pm-stat-details">
            <h3>Total Spent/Allocated</h3>
            <p className="pm-stat-value">{formatCurrency(totalSpent)}</p>
          </div>
        </div>

        <div className={`pm-stat-card ${isNegative ? 'pm-negative' : 'pm-positive'}`}>
          <div className="pm-stat-icon" style={{ backgroundColor: isNegative ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.1)', color: isNegative ? '#ef4444' : '#0f172a' }}>
            <IndianRupee size={32} />
          </div>
          <div className="pm-stat-details">
            <h3>Remaining Balance</h3>
            <p className="pm-stat-value">{formatCurrency(remaining)}</p>
            {isNegative && <span className="pm-alert-badge">Overspent</span>}
          </div>
        </div>
      </div>

      <div className="pm-main-grid">
        <div className="pm-chart-section">
          <div className="pm-card">
            <h2>Allocation Breakdown</h2>
            <div className="pm-chart-container">
              {allocations.length === 0 ? (
                <div className="pm-empty-chart">No allocations yet. Add some below!</div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={6}
                      dataKey="value"
                      animationDuration={1200}
                      animationBegin={100}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="pm-card" style={{ marginTop: '20px' }}>
            <h2>Profit vs Spending</h2>
            <div className="pm-chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={barData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                  <Legend />
                  <Bar dataKey="Total Profit" fill="#10b981" radius={[0, 8, 8, 0]} barSize={28} animationDuration={1200} />
                  <Bar dataKey="Total Spent" fill="#3b82f6" radius={[0, 8, 8, 0]} barSize={28} animationDuration={1200} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="pm-action-section">
          <div className="pm-card pm-form-card">
            <h2>Add New Allocation</h2>
            <form onSubmit={handleAdd} className="pm-form">
              <div className="pm-form-group" style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Description (e.g. Rent, Investment)</label>
                <input 
                  type="text" 
                  value={desc} 
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Where did the money go?"
                  required
                  style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                />
              </div>
              <div className="pm-form-group" style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px', display: 'block' }}>Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  style={{ padding: '12px 14px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-main)', color: 'var(--text-main)', width: '100%', outline: 'none' }}
                />
              </div>
              <button type="submit" className="pm-submit-btn" disabled={isSubmitting} style={{ padding: '12px 24px', borderRadius: '8px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', border: 'none', color: 'white', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 500 }}>
                {isSubmitting ? 'Adding...' : <><Plus size={18} /> Add Allocation</>}
              </button>
            </form>
          </div>

          <div className="pm-card pm-list-card">
            <h2>Recent Allocations</h2>
            <div className="pm-list">
              {allocations.length === 0 ? (
                <p className="pm-empty-text">No allocations recorded for this month.</p>
              ) : (
                allocations.map(a => (
                  <div key={a.id} className="pm-list-item">
                    <div className="pm-item-info">
                      <span className="pm-item-desc">{a.description}</span>
                      <span className="pm-item-date">{new Date(a.date).toLocaleDateString()}</span>
                    </div>
                    <div className="pm-item-actions">
                      <span className="pm-item-amount">{formatCurrency(a.amount)}</span>
                      <button onClick={() => handleDelete(a.id)} className="pm-delete-btn">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
