"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  ShoppingCart, 
  Users, 
  Truck, 
  BarChart2, 
  Wallet, 
  CreditCard, 
  Settings,
  ChevronRight,
  MessageCircle,
  ShieldAlert,
  Settings as SettingsIcon
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useSession } from 'next-auth/react';
import './Sidebar.css';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, ownerOnly: true },
  { name: 'Inventory', path: '/inventory', icon: Package },
  { name: 'Sales / Bills', path: '/sales', icon: Receipt },
  { name: 'Purchases', path: '/purchases', icon: ShoppingCart, ownerOnly: true },
  { name: 'Customers', path: '/customers', icon: Users },
  { name: 'Suppliers', path: '/suppliers', icon: Truck },
  { name: 'Reports', path: '/reports', icon: BarChart2, ownerOnly: true },
  { name: 'Expenses', path: '/expenses', icon: Wallet, ownerOnly: true },
  { name: 'Payments', path: '/payments', icon: CreditCard, ownerOnly: true },
  { name: 'Communications', path: '/communications', icon: MessageCircle },
  { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, ownerOnly: true },
  { name: 'Settings', path: '/settings', icon: Settings, ownerOnly: true },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isOwner = session?.user && (session.user as any).role === 'OWNER';

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon" style={{ background: 'transparent', padding: 0 }}>
          <img src="/logo.png" alt="Logo" style={{ width: '40px', height: 'auto', objectFit: 'contain' }} />
        </div>
        <div className="logo-text">
          <h2>Bharat Hydraulics</h2>
          <p>Hydraulic Pipes & Fittings</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => {
          if (item.ownerOnly && !isOwner) return null;
          
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link 
              href={item.path} 
              key={item.name} 
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => document.body.classList.remove('sidebar-open')}
            >
              <div className="nav-item-left">
                <Icon size={20} />
                <span>{item.name}</span>
              </div>
              {item.name !== 'Dashboard' && <ChevronRight size={16} opacity={0.5} />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <LogoutButton />
      </div>
    </aside>
  );
}
