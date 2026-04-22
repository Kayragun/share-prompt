'use client';

import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();

  function switchLocale(next: string) {
    // Replace locale prefix in path
    const segments = pathname.split('/');
    segments[1] = next;
    router.push(segments.join('/'));
  }

  return (
    <div className="flex gap-1">
      <Button
        variant={locale === 'tr' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('tr')}
        className="text-xs px-2 h-7"
      >
        TR
      </Button>
      <Button
        variant={locale === 'en' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchLocale('en')}
        className="text-xs px-2 h-7"
      >
        EN
      </Button>
    </div>
  );
}
