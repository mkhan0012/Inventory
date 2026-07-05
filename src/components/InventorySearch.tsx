"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function InventorySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        router.push(`/inventory?search=${encodeURIComponent(searchTerm)}`);
      } else {
        router.push(`/inventory`);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router]);

  return (
    <div className="search-box">
      <Search size={16} color="var(--text-muted)" />
      <input 
        type="text" 
        placeholder="Search items..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
