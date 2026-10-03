'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SearchBarProps {
  className?: string;
  size?: 'default' | 'large';
}

export function SearchBar({ className, size = 'default' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/jobs?q=${encodeURIComponent(q)}` : '/jobs');
  };

  return (
    <form
      onSubmit={handleSearch}
      className={
        'flex w-full items-center gap-2 rounded-xl border bg-card p-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'
        + (size === 'large' ? ' md:p-2' : '')
        + (className ? ` ${className}` : '')
      }
      role="search"
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search jobs, exams, organizations, results…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={
            'border-0 pl-9 shadow-none focus-visible:ring-0'
            + (size === 'large' ? ' h-12 text-base' : '')
          }
          aria-label="Search SarkariSetu"
        />
      </div>
      <Button type="submit" size={size === 'large' ? 'lg' : 'default'}>
        Search
      </Button>
    </form>
  );
}
