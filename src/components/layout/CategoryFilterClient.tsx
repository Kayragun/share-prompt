'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search } from 'lucide-react';
import type { Category } from '@/lib/supabase/types';

type Props = {
  categories: Category[];
  locale: string;
  activeSlug?: string;
  searchQuery?: string;
  allLabel: string;
  searchPlaceholder: string;
};

export default function CategoryFilterClient({
  categories,
  locale,
  activeSlug,
  searchQuery = '',
  allLabel,
  searchPlaceholder,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(searchQuery);

  function navigate(category?: string, search?: string) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('q', search);
    const qs = params.toString();
    router.push(`${pathname}${qs ? `?${qs}` : ''}`);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    navigate(activeSlug, q);
  }

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
    </div>
  );
}
