import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ locale: string }>;
};

const gradients = [
  'from-blue-500/10 to-cyan-500/10 border-blue-500/20',
  'from-purple-500/10 to-pink-500/10 border-purple-500/20',
  'from-orange-500/10 to-yellow-500/10 border-orange-500/20',
  'from-green-500/10 to-emerald-500/10 border-green-500/20',
  'from-red-500/10 to-rose-500/10 border-red-500/20',
  'from-indigo-500/10 to-violet-500/10 border-indigo-500/20',
  'from-teal-500/10 to-cyan-500/10 border-teal-500/20',
  'from-amber-500/10 to-orange-500/10 border-amber-500/20',
];

export default async function CategoriesPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('categories');
  const supabase = await createClient();

  // Kategoriler ve prompt kategori ID'leri paralel çekilir; sayım JS'te yapılır (kategori başına ayrı sorgu yerine).
  const [{ data: rawCategories }, { data: promptCategoryIds }] = await Promise.all([
    supabase.from('categories').select('*').order('id'),
    supabase.from('prompts').select('category_id'),
  ]);

  const categories = rawCategories
    ? [...rawCategories].sort((a, b) => (a.slug === 'diger' ? 1 : b.slug === 'diger' ? -1 : 0))
    : rawCategories;

  const counts: Record<number, number> = {};
  for (const row of promptCategoryIds ?? []) {
    if (row.category_id != null) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('title')}</h1>
        <p className="text-muted-foreground">{t('subtitle')}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {categories?.map((cat, i) => (
          <Link
            key={cat.slug}
            href={`/${locale}?category=${cat.slug}`}
            className={`group rounded-xl border bg-gradient-to-br ${gradients[i % gradients.length]} p-4 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5`}
          >
            <div className="text-3xl mb-2">{cat.icon}</div>
            <h2 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {locale === 'tr' ? cat.name_tr : cat.name_en}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {counts[cat.id] ?? 0} prompts
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
