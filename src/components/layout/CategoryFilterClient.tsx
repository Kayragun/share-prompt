'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Category } from '@/lib/supabase/types';

type SortKey = 'newest' | 'stars' | 'forks';

type Props = {
  categories: Category[];
  locale: string;
  activeSlug?: string;
  searchQuery?: string;
  activeSort?: SortKey;
  allLabel: string;
  searchPlaceholder: string;
  sortLabels: Record<SortKey, string>;
};

export default function CategoryFilterClient({
  categories,
  locale,
  activeSlug,
  searchQuery = '',
  activeSort = 'newest',
  allLabel,
  searchPlaceholder,
  sortLabels,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(searchQuery);

  function navigate(category?: string, search?: string, sort: SortKey = activeSort) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('q', search);
    if (sort !== 'newest') params.set('sort', sort);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(activeSlug, q);
  }

  const sortKeys: SortKey[] = ['newest', 'stars', 'forks'];

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="pl-9"
        />
      </form>
      <div className="flex flex-wrap gap-2.5">
        <button
          className={cn(
            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 border select-none outline-none",
            !activeSlug
              ? "bg-primary text-primary-foreground border-transparent"
              : "bg-background/50 hover:bg-muted border-border/50 text-muted-foreground hover:text-foreground"
          )}
          onClick={() => navigate(undefined, q)}
        >
          {allLabel}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-200 flex items-center gap-2 border select-none outline-none",
              activeSlug === cat.slug
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-background/50 hover:bg-muted border-border/50 text-muted-foreground hover:text-foreground"
            )}
            onClick={() => navigate(cat.slug, q)}
          >
            <span className="text-base leading-none opacity-80">{cat.icon}</span>
            {locale === 'tr' ? cat.name_tr : cat.name_en}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1.5 text-sm">
        {sortKeys.map((key) => (
          <button
            key={key}
            onClick={() => navigate(activeSlug, q, key)}
            className={cn(
              "px-3 py-1 rounded-md font-medium transition-colors duration-200 select-none outline-none",
              activeSort === key
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {sortLabels[key]}
          </button>
        ))}
      </div>
    </div>
  );
}
