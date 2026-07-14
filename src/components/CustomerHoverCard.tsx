"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Phone, User, Calendar, CreditCard } from 'lucide-react';

interface CustomerHoverCardProps {
  customerName: string;
  amount: number;
}

export default function CustomerHoverCard({ customerName, amount }: CustomerHoverCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 200);
  };

  return (
    <div 
      className="customer-hover-wrapper" 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span style={{ cursor: 'pointer', textDecoration: 'underline', textDecorationStyle: 'dashed', textDecorationColor: 'var(--border)' }}>
        {customerName}
      </span>

      {isHovered && (
        <div 
          ref={cardRef}
          style={{
            position: 'absolute',
            left: '50%',
            bottom: '100%',
            transform: 'translateX(-50%)',
            marginBottom: '8px',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            width: '240px',
            zIndex: 100,
            padding: '16px',
            color: 'var(--text-main)',
            animation: 'fade-in-up 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', fontWeight: 600 }}>
              {customerName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{customerName}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Customer</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <Phone size={14} color="var(--text-muted)" />
              <span>+91 XXXXX XXXXX</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <CreditCard size={14} color="var(--text-muted)" />
              <span>Invoice Total: ₹{amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
