"use client";
import React, { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import toast from 'react-hot-toast';

export default function PrintButton() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = async () => {
    setIsExporting(true);
    const toastId = toast.loading('Generating PDF...');
    try {
      const element = document.querySelector('.print-container') as HTMLElement;
      if (!element) throw new Error('Print container not found');

      // Hide no-print elements temporarily
      const noPrintElements = document.querySelectorAll('.no-print');
      noPrintElements.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
      });

      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.offsetWidth,
        windowHeight: document.documentElement.offsetHeight
      });
      
      // Restore no-print elements
      noPrintElements.forEach((el) => {
        (el as HTMLElement).style.display = '';
      });

      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF with custom dimensions matching the canvas
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`Invoice_${Date.now()}.pdf`);
      
      toast.success('PDF Exported Successfully!', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate PDF.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button className="action-btn print-btn" onClick={() => window.print()}>
        <Printer size={18} /> Print Invoice
      </button>
      <button className="action-btn" onClick={handleExportPdf} disabled={isExporting} style={{ background: '#8b5cf6', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Download size={18} /> {isExporting ? 'Generating...' : 'Export PDF'}
      </button>
    </div>
  );
}
