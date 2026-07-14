"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MoreVertical, Download, MessageSquare, CheckCircle, FileText } from 'lucide-react';

interface TableActionMenuProps {
  saleId: string;
  status: string;
}

export default function TableActionMenu({ saleId, status }: TableActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.12), 0 2px 10px rgba(0,0,0,0.04)',
          width: '180px',
          zIndex: 50,
          padding: '4px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px'
        }}>
          <button className="menu-item-btn">
            <Download size={14} /> Download PDF
          </button>
          <button className="menu-item-btn">
            <MessageSquare size={14} /> Send WhatsApp
          </button>
          <button className="menu-item-btn">
            <FileText size={14} /> View Details
          </button>
          {status !== 'PAID' && (
            <button className="menu-item-btn" style={{ color: '#10b981' }}>
              <CheckCircle size={14} /> Mark as Paid
            </button>
          )}
        </div>
      )}
    </div>
  );
}
