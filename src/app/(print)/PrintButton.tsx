"use client";
import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button className="action-btn print-btn" onClick={() => window.print()}>
      <Printer size={18} /> Print Invoice
    </button>
  );
}
