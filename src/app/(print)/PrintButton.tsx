"use client";
import React from 'react';
import { Printer } from 'lucide-react';

export default function PrintButton() {
  return (
    <button className="no-print print-btn" onClick={() => window.print()}>
      <Printer size={16} /> Print Document
    </button>
  );
}
