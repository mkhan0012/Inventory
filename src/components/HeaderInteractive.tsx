"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, ChevronDown, LogOut, Settings, Package, Receipt, Users, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

interface Props {
  name: string;
  role: string;
}

export default function HeaderInteractive({ name, role }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  // Basic click outside handler would go here (omitted for brevity, using simple toggles)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Basic implementation: go to inventory with search query in URL
      // Since inventory doesn't strictly have a search param setup yet, it's a foundation
      router.push(`/inventory?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
      
      <form onSubmit={handleSearch} className="search-bar" style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-main)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)' }}
        />
      </form>

      <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '16px', position: 'relative' }}>
        
        {/* Quick Add Menu */}
        <div style={{ position: 'relative' }}>
          <button className="icon-btn primary" onClick={() => setShowAddMenu(!showAddMenu)} style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <Plus size={20} />
          </button>
          
          {showAddMenu && (
            <div style={{ position: 'absolute', top: '50px', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px', minWidth: '160px', zIndex: 10 }}>
              <Link href="/sales" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', textDecoration: 'none', color: 'var(--text-main)' }} onClick={() => setShowAddMenu(false)}>
                <Receipt size={16} /> New Invoice
              </Link>
              <Link href="/inventory" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', textDecoration: 'none', color: 'var(--text-main)' }} onClick={() => setShowAddMenu(false)}>
                <Package size={16} /> Add Product
              </Link>
              <Link href="/customers" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', textDecoration: 'none', color: 'var(--text-main)' }} onClick={() => setShowAddMenu(false)}>
                <Users size={16} /> Add Customer
              </Link>
            </div>
          )}
        </div>
        
        {/* Notifications (Static demo) */}
        <button className="icon-btn" onClick={() => alert("Check Inventory page for Low Stock alerts and Communications for missing clients!")} style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
          <Bell size={20} color="var(--text-main)" />
          <span className="badge" style={{ position: 'absolute', top: '0', right: '0', background: 'var(--danger)', width: '10px', height: '10px', borderRadius: '50%' }}></span>
        </button>

        {/* Profile Menu */}
        <div style={{ position: 'relative' }}>
          <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '4px 8px', borderRadius: '8px' }}>
            <div className="avatar" style={{ background: 'var(--primary)', color: 'white', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info" style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="user-name" style={{ fontWeight: '500', fontSize: '14px' }}>{name}</span>
              <span className="user-role" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{role === 'OWNER' ? 'Owner' : 'Staff'}</span>
            </div>
            <ChevronDown size={16} color="var(--text-muted)" />
          </div>

          {showProfileMenu && (
            <div style={{ position: 'absolute', top: '50px', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '8px', minWidth: '160px', zIndex: 10 }}>
              <Link href="/settings" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', textDecoration: 'none', color: 'var(--text-main)' }} onClick={() => setShowProfileMenu(false)}>
                <Settings size={16} /> Settings
              </Link>
              <div 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', color: 'var(--danger)', cursor: 'pointer' }}
                onClick={() => signOut({ callbackUrl: '/login' })}
              >
                <LogOut size={16} /> Sign Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
