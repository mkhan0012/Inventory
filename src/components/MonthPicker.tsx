"use client";
import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function MonthPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const month = searchParams.get('month') || currentMonthStr;

  return (
    <input 
      type="month" 
      value={month} 
      onChange={(e) => {
        if (e.target.value) {
          router.push(`?month=${e.target.value}`);
        } else {
          router.push(`?month=${currentMonthStr}`);
        }
      }} 
      style={{ padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '6px', background: 'var(--bg-card)', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
    />
  );
}
