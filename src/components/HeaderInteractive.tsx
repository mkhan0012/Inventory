"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Bell, ChevronDown, LogOut, Settings, Package, Receipt, Users, AlertTriangle, Menu } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

interface Props {
  name: string;
  role: string;
  alerts?: { id: string, name: string, stock: number }[];
}

export default function HeaderInteractive({ name, role, alerts = [] }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Basic implementation: go to inventory with search query in URL
      // Since inventory doesn't strictly have a search param setup yet, it's a foundation
      router.push(`/inventory?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const toggleSidebar = () => {
    document.body.classList.toggle('sidebar-open');
  };

  return (
    <>
      <button className="mobile-menu-btn" onClick={toggleSidebar}>
        <Menu size={24} />
      </button>

      <div className="header-right">

      <form onSubmit={handleSearch} className="search-bar">
        <Search size={18} color="var(--text-muted)" style={{ marginRight: '8px' }} />
        <input 
          type="text" 
          placeholder="Search inventory..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ border: 'none', background: 'transparent', outline: 'none', color: 'var(--text-main)' }}
        />
      </form>

      <div className="header-actions">
        
        {/* Quick Add Menu */}
        <div className="desktop-only" style={{ position: 'relative' }}>
          <button className="icon-btn primary" onClick={() => setShowAddMenu(!showAddMenu)}>
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
        
        {/* Notifications */}
        <div style={{ position: 'relative' }}>
          <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
            <Bell size={20} color="var(--text-main)" />
            {alerts.length > 0 && (
              <span className="badge" style={{ position: 'absolute', top: '0', right: '0', background: 'var(--danger)', width: '10px', height: '10px', borderRadius: '50%' }}></span>
            )}
          </button>
          
          {showNotifications && (
            <div style={{ position: 'absolute', top: '50px', right: '0', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', padding: '12px', minWidth: '300px', zIndex: 10, maxHeight: '400px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--border)' }}>Notifications ({alerts.length})</h3>
              {alerts.length === 0 ? (
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>You're all caught up!</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts.map(alert => (
                    <Link key={alert.id} href="/inventory" onClick={() => setShowNotifications(false)} style={{ display: 'flex', flexDirection: 'column', padding: '8px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '6px', borderLeft: '3px solid var(--danger)', textDecoration: 'none' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>{alert.name}</span>
                      <span style={{ fontSize: '12px', color: 'var(--danger)' }}>{alert.stock === 0 ? 'Out of stock' : `Low stock: ${alert.stock} left`}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {mounted && (
          <button className="icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ fontSize: '18px' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        )}

        {/* Profile Menu */}
        <div style={{ position: 'relative' }}>
          <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <div className="avatar">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
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
    </>
  );
}
