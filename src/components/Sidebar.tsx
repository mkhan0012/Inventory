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
  ChevronLeft,
  Menu,
  PieChart
} from 'lucide-react';
import LogoutButton from './LogoutButton';
import { useSession } from 'next-auth/react';
import './Sidebar.css';

const navGroups = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', path: '/', icon: LayoutDashboard, ownerOnly: true },
      { name: 'Reports', path: '/reports', icon: PieChart, ownerOnly: true },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Sales / Bills', path: '/sales', icon: Receipt },
      { name: 'Purchases', path: '/purchases', icon: ShoppingCart, ownerOnly: true },
      { name: 'Inventory', path: '/inventory', icon: Package },
    ]
  },
  {
    title: 'Finance',
    items: [
      { name: 'Expenses', path: '/expenses', icon: Wallet, ownerOnly: true },
      { name: 'Profit Alloc.', path: '/profit-management', icon: BarChart2, ownerOnly: true },
      { name: 'Payments', path: '/payments', icon: CreditCard, ownerOnly: true },
    ]
  },
  {
    title: 'Directory',
    items: [
      { name: 'Customers', path: '/customers', icon: Users },
      { name: 'Suppliers', path: '/suppliers', icon: Truck },
      { name: 'Communications', path: '/communications', icon: MessageCircle },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Audit Logs', path: '/audit', icon: ShieldAlert, ownerOnly: true },
      { name: 'Settings', path: '/settings', icon: Settings, ownerOnly: true },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isOwner = session?.user && (session.user as any).role === 'OWNER';
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <>
      <div className="sidebar-overlay" onClick={() => document.body.classList.remove('sidebar-open')}></div>
      <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-icon" style={{ background: 'transparent', padding: 0 }}>
            <img src="/logo.png" alt="Logo" style={{ width: '32px', height: 'auto', objectFit: 'contain' }} />
          </div>
          <div className="logo-text">
            <h2>Bharat Hydraulics</h2>
            <p>Admin Portal</p>
          </div>
          <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? <Menu size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {navGroups.map((group, groupIdx) => {
            const visibleItems = group.items.filter(item => !item.ownerOnly || isOwner);
            if (visibleItems.length === 0) return null;

            return (
              <div key={group.title} className="nav-group">
                {!isCollapsed && <div className="nav-group-title">{group.title}</div>}
                {visibleItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <Link 
                      href={item.path} 
                      key={item.name} 
                      className={`nav-item ${isActive ? 'active' : ''}`}
                      onClick={() => document.body.classList.remove('sidebar-open')}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <div className="nav-item-left">
                        <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                        <span>{item.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}
