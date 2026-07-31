"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface Props {
  tabs: {
    name: string;
    href: string;
  }[];
}

export default function PageTabs({ tabs }: Props) {
  const pathname = usePathname();
  
  return (
    <div style={{ display: 'flex', gap: '24px', borderBottom: '1px solid var(--border)', marginBottom: '24px' }}>
      {tabs.map(tab => {
        const isActive = pathname === tab.href;
        return (
          <Link 
            key={tab.name}
            href={tab.href}
            style={{ 
              padding: '12px 0', 
              borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
              color: isActive ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: 600,
              fontSize: '14px',
              textDecoration: 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.name}
          </Link>
        );
      })}
    </div>
  );
}
