"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Download, MessageSquare, CheckCircle, FileText } from 'lucide-react';
import { markInvoiceAsPaid } from '@/actions/sales';

interface TableActionMenuProps {
  saleId: string;
  status: string;
}

export default function TableActionMenu({ saleId, status }: TableActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMarking, setIsMarking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleDownload = () => {
    window.open(`/sales/${saleId}/print`, '_blank');
    setIsOpen(false);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Hello, here is the link to your invoice: ${window.location.origin}/sales/${saleId}/print`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setIsOpen(false);
  };

  const handleViewDetails = () => {
    window.open(`/sales/${saleId}/print`, '_blank');
    setIsOpen(false);
  };

  const handleMarkAsPaid = async () => {
    setIsMarking(true);
    try {
      const res = await markInvoiceAsPaid(saleId);
      if (res?.error) {
        alert(res.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to mark as paid.");
    } finally {
      setIsMarking(false);
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="table-action-menu" style={{ position: 'relative' }} ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: isOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
          border: 'none', 
          borderRadius: '4px',
          padding: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'background 0.2s, color 0.2s'
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-main)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = isOpen ? 'var(--text-main)' : 'var(--text-muted)'; e.currentTarget.style.background = isOpen ? 'rgba(255,255,255,0.1)' : 'transparent'; }}
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          marginTop: '4px',
          background: 'var(--bg-card)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: 'var(--shadow-card)',
          width: '180px',
          zIndex: 50,
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <button className="menu-item-btn" onClick={handleDownload}>
            <Download size={14} /> Download PDF
          </button>
          <button className="menu-item-btn" onClick={handleWhatsApp}>
            <MessageSquare size={14} /> Send WhatsApp
          </button>
          <button className="menu-item-btn" onClick={handleViewDetails}>
            <FileText size={14} /> View Details
          </button>
          {status !== 'PAID' && (
            <button className="menu-item-btn" style={{ color: '#10b981' }} onClick={handleMarkAsPaid} disabled={isMarking}>
              <CheckCircle size={14} /> {isMarking ? 'Marking...' : 'Mark as Paid'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
