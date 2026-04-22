import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import PromptCard from '@/components/prompts/PromptCard';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function StarredPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();
  const t = await getTranslations('profile');

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  // Yıldızlanan prompt ID'lerini çek
  const { data: stars } = await supabase
    .from('prompt_stars')
    .select('prompt_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const promptIds = (stars ?? []).map((s) => s.prompt_id);

  if (promptIds.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">{t('starredPrompts')}</h1>
        <p className="text-center text-muted-foreground py-12">{t('noPrompts')}</p>
      </div>
    );
  }

  // Promptları çek
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .in('id', promptIds);

  // Profil ve kategori bilgilerini toplu çek
  const userIds = [...new Set((prompts ?? []).map((p) => p.user_id))];
  const categoryIds = [...new Set((prompts ?? []).map((p) => p.category_id))];

  const [{ data: profiles }, { data: categories }] = await Promise.all([
    supabase.from('profiles').select('id, username, full_name, avatar_url').in('id', userIds),
    supabase.from('categories').select('id, slug, name_tr, name_en, icon').in('id', categoryIds),
  ]);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));
  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  const enrichedPrompts = (prompts ?? []).map((p) => ({
    ...p,
    profiles: profileMap[p.user_id] ?? { username: 'anonim', full_name: null, avatar_url: null },
    categories: categoryMap[p.category_id] ?? { slug: '', name_tr: 'Diğer', name_en: 'Other', icon: '' },
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('starredPrompts')}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrichedPrompts.map((prompt) => (
          <PromptCard
            key={prompt.id}
            prompt={prompt as Parameters<typeof PromptCard>[0]['prompt']}
            locale={locale}
            currentUserId={user.id}
            initialStarred
          />
        ))}
      </div>
    </div>
  );
}
