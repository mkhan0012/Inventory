import React from 'react';
import { Search, Plus, Bell, ChevronDown } from 'lucide-react';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import HeaderInteractive from "./HeaderInteractive";
import './Header.css';

export default async function Header() {
  const session = await getServerSession(authOptions);
  const name = session?.user?.name || 'User';
  const role = (session?.user as any)?.role || 'STAFF';

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="greeting">Good Morning, {name.split(' ')[0]} 👋</h1>
        <p className="sub-greeting">Here's what's happening with your business today.</p>
      </div>

      <HeaderInteractive name={name} role={role} />
    </header>
  );
}
