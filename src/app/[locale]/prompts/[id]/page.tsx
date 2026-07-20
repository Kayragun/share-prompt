import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn, countTokens } from '@/lib/utils';
import CopyButton from '@/components/prompts/CopyButton';
import DeletePromptButton from '@/components/prompts/DeletePromptButton';
import ForkedVersions from '@/components/prompts/ForkedVersions';
import OutputDisplay from '@/components/prompts/OutputDisplay';
import StarButton from '@/components/prompts/StarButton';
import ReportButton from '@/components/prompts/ReportButton';
import { GitFork, ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: prompt } = await supabase
    .from('prompts')
    .select('title, description')
    .eq('id', id)
    .single();

  const title = prompt?.title ?? 'SharePrompt';
  const description = prompt?.description ?? 'Discover, share and improve AI prompts on SharePrompt.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: 'SharePrompt',
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
  };
}

export default async function PromptDetailPage({ params }: Props) {
  const { locale, id } = await params;
  const t = await getTranslations('prompt');
  const supabase = await createClient();

  // Prompt'u ayrı çek
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (promptError || !prompt) {
    console.error('Prompt fetch error:', promptError);
    notFound();
  }

  // Profil ve kategoriyi ayrı çek (JOIN yerine)
  const [{ data: profile }, { data: category }, { data: outputs }] = await Promise.all([
    supabase.from('profiles').select('username, full_name, avatar_url').eq('id', prompt.user_id).single(),
    supabase.from('categories').select('slug, name_tr, name_en, icon').eq('id', prompt.category_id).single(),
    supabase.from('prompt_outputs').select('*').eq('prompt_id', id),
  ]);

  const user = await getUser();

  let isStarred = false;
  if (user) {
    const { data } = await supabase
      .from('prompt_stars')
      .select('user_id')
      .match({ user_id: user.id, prompt_id: id })
      .maybeSingle();
    isStarred = !!data;
  }

  // Fork ise üst prompt bilgisi
  let parentPrompt = null;
  if (prompt.parent_id) {
    const { data } = await supabase
      .from('prompts')
      .select('id, title')
      .eq('id', prompt.parent_id)
      .single();
    parentPrompt = data;
  }

  const categoryName = locale === 'tr' ? category?.name_tr : category?.name_en;

  return (
    <div className="max-w-3xl mx-auto">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> {t('back')}
      </Link>

      {parentPrompt && (
        <div className="mb-4 p-3 bg-muted/40 rounded-lg text-sm flex items-center gap-2">
          <GitFork className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground">{t('forkedFrom')}:</span>
          <Link href={`/${locale}/prompts/${parentPrompt.id}`} className="text-primary hover:underline font-medium">
            {parentPrompt.title}
          </Link>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-2xl font-bold flex-1">{prompt.title}</h1>
            {category && (
              <Badge variant="secondary">
                {category.icon} {categoryName}
              </Badge>
            )}
          </div>
          {prompt.description && (
            <p className="text-muted-foreground mt-2">{prompt.description}</p>
          )}
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            {profile ? (
              <Link
                href={`/${locale}/profile/${profile.username}`}
                className="flex items-center gap-2 hover:opacity-80"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={profile.avatar_url ?? undefined} />
                  <AvatarFallback className="text-xs">{profile.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{profile.username}</span>
              </Link>
            ) : (
              <span className="text-sm text-muted-foreground">{t('anonymous')}</span>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" /> {prompt.fork_count}
              </span>
              <StarButton
                promptId={id}
                initialStarred={isStarred}
                initialCount={prompt.star_count}
                currentUserId={user?.id}
              />
              {user?.id !== prompt.user_id && (
                <ReportButton promptId={id} currentUserId={user?.id} showLabel />
              )}
            </div>
          </div>
        </div>

        <Separator />

        <div className="relative">
          <div className="absolute top-3 right-3">
            <CopyButton text={prompt.content} />
          </div>
          <pre className="bg-muted/40 rounded-lg p-4 text-sm whitespace-pre-wrap font-mono leading-relaxed pr-28">
            {prompt.content}
          </pre>
          <p className="text-xs text-right mt-1 text-blue-500 dark:text-blue-400 font-mono">
            ~{(prompt.token_count > 0 ? prompt.token_count : countTokens(prompt.content)).toLocaleString()} {t('tokens')}
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {user && (
            <Link
              href={`/${locale}/prompts/${id}/fork`}
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
            >
              <GitFork className="h-4 w-4" /> {t('fork')}
            </Link>
          )}
          {user?.id === prompt.user_id && (
            <DeletePromptButton promptId={id} locale={locale} />
          )}
        </div>

        <Separator />

        <OutputDisplay outputs={outputs ?? []} />

        <Separator />

        <ForkedVersions promptId={id} locale={locale} currentUserId={user?.id} />
      </div>
    </div>
  );
}
