'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  const t = useTranslations('faq');
  const [openIndexes, setOpenIndexes] = useState<Set<number>>(new Set());

  const items = [
    { q: t('q1'), a: t('a1') },
    { q: t('q2'), a: t('a2') },
    { q: t('q3'), a: t('a3') },
    { q: t('q4'), a: t('a4') },
    { q: t('q5'), a: t('a5') },
    { q: t('q6'), a: t('a6') },
  ];

  return (
    <section className="mt-16 mb-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{t('title')}</h2>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>

      <div className="space-y-2 max-w-3xl">
        {items.map((item, i) => {
          const isOpen = openIndexes.has(i);
          return (
            <div
              key={i}
              className="border rounded-xl overflow-hidden bg-card transition-colors"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium hover:bg-muted/50 transition-colors gap-4"
                onClick={() => {
                  setOpenIndexes(prev => {
                    const next = new Set(prev);
                    if (next.has(i)) next.delete(i);
                    else next.add(i);
                    return next;
                  });
                }}
                aria-expanded={isOpen}
              >
                <span className="text-sm sm:text-base">{item.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96' : 'max-h-0'}`}
              >
                <p className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
