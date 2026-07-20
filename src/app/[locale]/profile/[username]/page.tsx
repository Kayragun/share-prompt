import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import PromptCard from '@/components/prompts/PromptCard';
import ContributionScore from '@/components/profile/ContributionScore';
import ContributionHeatmap from '@/components/profile/ContributionHeatmap';
import { Briefcase, GraduationCap, Calendar } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { locale, username } = await params;
  const t = await getTranslations('profile');
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single();

  if (!profile) notFound();

  const user = await getUser();

  // Promptları JOIN olmadan çek
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  // Kategori bilgilerini toplu çek
  const categoryIds = [...new Set((prompts ?? []).map((p) => p.category_id))];
  const { data: categories } = categoryIds.length > 0
    ? await supabase.from('categories').select('id, slug, name_tr, name_en, icon').in('id', categoryIds)
    : { data: [] };

  const categoryMap = Object.fromEntries((categories ?? []).map((c) => [c.id, c]));

  const promptCount = prompts?.length ?? 0;
  const totalStars = prompts?.reduce((sum, p) => sum + (p.star_count ?? 0), 0) ?? 0;

  // Yıldızlananlar
  let starredIds: Set<string> = new Set();
  if (user) {
    const { data: stars } = await supabase
      .from('prompt_stars')
      .select('prompt_id')
      .eq('user_id', user.id);
    starredIds = new Set(stars?.map((s) => s.prompt_id) ?? []);
  }

  const joinedDate = new Date(profile.created_at).toLocaleDateString(
    locale === 'tr' ? 'tr-TR' : 'en-US',
    { year: 'numeric', month: 'long' }
  );

  const enrichedPrompts = (prompts ?? []).map((p) => ({
    ...p,
    profiles: { username: profile.username, full_name: profile.full_name, avatar_url: profile.avatar_url },
    categories: categoryMap[p.category_id] ?? { slug: '', name_tr: 'Diğer', name_en: 'Other', icon: '' },
  }));

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start gap-6 mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-2xl">
            {profile.username[0]?.toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{profile.full_name || profile.username}</h1>
          <p className="text-muted-foreground">@{profile.username}</p>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {profile.show_profession && profile.profession && (
              <span className="flex items-center gap-1.5">
                <Briefcase className="h-4 w-4" /> {profile.profession}
              </span>
            )}
            {profile.show_education && profile.education && (
              <span className="flex items-center gap-1.5">
                <GraduationCap className="h-4 w-4" /> {profile.education}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" /> {t('joinedAt')}: {joinedDate}
            </span>
          </div>

          {profile.description && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border/50 text-sm">
              <h3 className="font-medium text-foreground mb-1">{t('description')}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{profile.description}</p>
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <span>
              <strong>{promptCount}</strong>{' '}
              <span className="text-muted-foreground">{t('prompts')}</span>
            </span>
            <span>
              <strong>{totalStars}</strong>{' '}
              <span className="text-muted-foreground">{t('stars')}</span>
            </span>
          </div>

          <div className="mt-3">
            <ContributionScore promptCount={promptCount} totalStars={totalStars} />
          </div>
        </div>
      </div>

      <ContributionHeatmap
        dates={(prompts ?? []).map((p) => p.created_at as string)}
        locale={locale}
        totalCount={promptCount}
      />

      <Separator className="my-6" />

      <h2 className="text-lg font-semibold mb-4">{t('prompts')}</h2>

      {enrichedPrompts.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">{t('noPrompts')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {enrichedPrompts.map((prompt) => (
            <PromptCard
              key={prompt.id}
              prompt={prompt as Parameters<typeof PromptCard>[0]['prompt']}
              locale={locale}
              currentUserId={user?.id}
              initialStarred={starredIds.has(prompt.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
