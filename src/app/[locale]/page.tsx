import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import PromptCard from '@/components/prompts/PromptCard';
import CategoryFilterClient from '@/components/layout/CategoryFilterClient';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/motion-wrappers';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string; q?: string; page?: string }>;
};

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { category, q, page: pageParam } = await searchParams;

  const PAGE_SIZE = 12;
  const page = Math.max(1, parseInt(pageParam ?? '1', 10));
  const offset = (page - 1) * PAGE_SIZE;

  const t = await getTranslations('home');
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: rawCategories } = await supabase.from('categories').select('*').order('id');
  const categories = rawCategories
    ? [...rawCategories].sort((a, b) => (a.slug === 'diger' ? 1 : b.slug === 'diger' ? -1 : 0))
    : rawCategories;

  let promptQuery = supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE); // PAGE_SIZE+1 fetch to detect next page

  if (category && categories) {
    const cat = categories.find((c) => c.slug === category);
    if (cat) promptQuery = promptQuery.eq('category_id', cat.id);
  }

  if (q) promptQuery = promptQuery.ilike('title', `%${q}%`);

  const { data: rawPrompts } = await promptQuery;
  const hasNextPage = (rawPrompts?.length ?? 0) > PAGE_SIZE;
  const prompts = hasNextPage ? rawPrompts!.slice(0, PAGE_SIZE) : rawPrompts;

  const userIds = [...new Set(prompts?.map((p) => p.user_id) ?? [])];
  const categoryIds = [...new Set(prompts?.map((p) => p.category_id) ?? [])];

  const [{ data: profiles }, { data: cats }] = await Promise.all([
    userIds.length > 0
      ? supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', userIds)
      : Promise.resolve({ data: [] }),
    categoryIds.length > 0
      ? supabase.from('categories').select('id, slug, name_tr, name_en, icon').in('id', categoryIds)
      : Promise.resolve({ data: [] }),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const categoryMap = Object.fromEntries((cats ?? []).map((c) => [c.id, c]));

  let starredIds: Set<string> = new Set();
  if (user) {
    const { data: stars } = await supabase.from('prompt_stars').select('prompt_id').eq('user_id', user.id);
    starredIds = new Set(stars?.map((s) => s.prompt_id) ?? []);
  }

  const enrichedPrompts = (prompts ?? []).map((p) => ({
    ...p,
    profiles: profileMap[p.user_id] ?? { username: 'anonymous', full_name: null, avatar_url: null },
    categories: categoryMap[p.category_id] ?? { slug: '', name_tr: '', name_en: '', icon: '' },
  }));

  const isFiltered = !!category || !!q;

  return (
    <div>
      {/* Hero — sadece filtre yoksa göster */}
      {!isFiltered && (
        <FadeIn delay={0.1}>
          <div className="relative mb-10 rounded-2xl overflow-hidden bg-muted/30 border border-border/50 px-6 py-12 text-center">
            <div className="absolute inset-0 bg-grid-pattern opacity-10" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-background/50 border border-border/50 text-primary text-xs font-medium px-4 py-1.5 rounded-full mb-6">
                <Sparkles className="h-3 w-3" /> {t('heroBadge')}
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">{t('title')}</h1>
              <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-8">{t('subtitle')}</p>
              {!user && (
                <div className="flex gap-3 justify-center">
                  <Link href={`/${locale}/auth/register`} className={cn(buttonVariants({ size: 'lg' }))}>
                    {t('getStarted')}
                  </Link>
                  <Link href={`/${locale}/categories`} className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'bg-background/50')}>
                    {t('browseCategories')}
                  </Link>
                </div>
              )}
              {user && (
                <Link href={`/${locale}/prompts/new`} className={cn(buttonVariants({ size: 'lg' }))}>
                  <Sparkles className="h-4 w-4 mr-2" /> {t('sharePrompt')}
                </Link>
              )}
            </div>
          </div>
        </FadeIn>
      )}

      <CategoryFilterClient
        categories={categories ?? []}
        locale={locale}
        activeSlug={category}
        searchQuery={q}
        allLabel={t('allCategories')}
        searchPlaceholder={t('searchPlaceholder')}
      />

      <div className="mt-8">
        {enrichedPrompts.length === 0 ? (
          <FadeIn>
            <div className="flex flex-col items-center justify-center py-20 text-center border rounded-2xl bg-background/50 border-dashed">
              <div className="h-20 w-20 bg-muted rounded-full flex items-center justify-center mb-6 shadow-inner">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{t('noPromptsTitle')}</h3>
              <p className="text-muted-foreground max-w-sm mb-6">{t('noPrompts')}</p>
              {user && (
                <Link href={`/${locale}/prompts/new`} className={cn(buttonVariants({ variant: 'default' }))}>
                  {t('shareNewPrompt')}
                </Link>
              )}
            </div>
          </FadeIn>
        ) : (
          <FadeIn delay={0.2}>
            <p className="text-sm text-muted-foreground mb-4 font-medium">
              {isFiltered
                ? t('promptCountFiltered', { count: enrichedPrompts.length })
                : t('promptCount', { count: enrichedPrompts.length })}
            </p>
            <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {enrichedPrompts.map((prompt) => (
                <StaggerItem key={prompt.id} className="h-full">
                  <PromptCard
                    prompt={prompt as Parameters<typeof PromptCard>[0]['prompt']}
                    locale={locale}
                    currentUserId={user?.id}
                    initialStarred={starredIds.has(prompt.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-4 mt-10">
              {page > 1 && (
                <Link
                  href={`/${locale}?${new URLSearchParams({ ...(category ? { category } : {}), ...(q ? { q } : {}), page: String(page - 1) })}`}
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  {t('prevPage')}
                </Link>
              )}
              {hasNextPage && (
                <Link
                  href={`/${locale}?${new URLSearchParams({ ...(category ? { category } : {}), ...(q ? { q } : {}), page: String(page + 1) })}`}
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                >
                  {t('loadMore')}
                </Link>
              )}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
