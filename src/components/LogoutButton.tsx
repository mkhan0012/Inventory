"use client";
import React from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export default function LogoutButton() {
  return (
    <div className="plan-card" style={{ padding: '12px', background: 'transparent', border: 'none' }}>
      <button 
        className="upgrade-btn" 
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: '#fee2e2', color: '#ef4444', border: 'none' }}
      >
        <LogOut size={16} /> Logout
      </button>
    </div>
  );
}
