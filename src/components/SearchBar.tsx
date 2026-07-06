"use client";
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchBarProps {
  placeholder?: string;
  basePath: string;
}

export default function SearchBar({ placeholder = "Search...", basePath }: SearchBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        router.push(`${basePath}?search=${encodeURIComponent(searchTerm)}`);
      } else {
        router.push(basePath);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, router, basePath]);

  return (
    <div className="search-box">
      <Search size={16} color="var(--text-muted)" />
      <input 
        type="text" 
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  );
}
