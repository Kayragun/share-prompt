import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GitFork } from 'lucide-react';
import ForkStarButton from './ForkStarButton';

type Props = {
  promptId: string;
  locale: string;
  currentUserId?: string;
};

export default async function ForkedVersions({ promptId, locale, currentUserId }: Props) {
  const t = await getTranslations('prompt');
  const supabase = await createClient();

  const { data: forks } = await supabase
    .from('prompts')
    .select('id, title, description, star_count, user_id, created_at')
    .eq('parent_id', promptId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (!forks || forks.length === 0) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <GitFork className="h-4 w-4" />
          {t('forkedVersions')}
        </h2>
        <p className="text-sm text-muted-foreground">{t('noForks')}</p>
      </div>
    );
  }

  // Profilleri toplu çek
  const userIds = [...new Set(forks.map((f) => f.user_id))];
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url')
    .in('id', userIds);

  const profileMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]));

  // Kullanıcının hangi fork'ları yıldızladığını çek
  let starredSet: Set<string> = new Set();
  if (currentUserId) {
    const forkIds = forks.map((f) => f.id);
    const { data: stars } = await supabase
      .from('prompt_stars')
      .select('prompt_id')
      .eq('user_id', currentUserId)
      .in('prompt_id', forkIds);
    starredSet = new Set(stars?.map((s) => s.prompt_id) ?? []);
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
        <GitFork className="h-4 w-4" />
        {t('forkedVersions')}
        <span className="text-sm font-normal text-muted-foreground">({forks.length})</span>
      </h2>
      <div className="space-y-3">
        {forks.map((fork) => {
          const profile = profileMap[fork.user_id];
          return (
            <div key={fork.id} className="border rounded-lg p-3 hover:bg-muted/40 transition-colors">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/${locale}/prompts/${fork.id}`}
                    className="font-medium text-sm hover:text-primary transition-colors line-clamp-1"
                  >
                    {fork.title}
                  </Link>
                  {fork.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{fork.description}</p>
                  )}
                </div>
                <ForkStarButton
                  promptId={fork.id}
                  initialStarred={starredSet.has(fork.id)}
                  initialCount={fork.star_count}
                  currentUserId={currentUserId}
                />
              </div>
              {profile && (
                <Link
                  href={`/${locale}/profile/${profile.username}`}
                  className="flex items-center gap-1.5 mt-2 hover:opacity-80"
                >
                  <Avatar className="h-4 w-4">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{profile.username[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground">{profile.username}</span>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
