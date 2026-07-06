"use client";

import React from 'react';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportTableButtonProps {
  data: any[];
  filename: string;
}

export default function ExportTableButton({ data, filename }: ExportTableButtonProps) {
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  return (
    <button 
      onClick={handleExport}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        fontSize: '12px',
        fontWeight: 500,
        color: 'var(--primary)',
        background: 'rgba(41, 98, 255, 0.1)',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => e.currentTarget.style.background = 'rgba(41, 98, 255, 0.15)'}
      onMouseOut={(e) => e.currentTarget.style.background = 'rgba(41, 98, 255, 0.1)'}
    >
      <Download size={14} /> Export
    </button>
  );
}
