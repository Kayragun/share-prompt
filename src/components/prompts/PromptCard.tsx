'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, GitFork, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import type { PromptWithDetails } from '@/lib/supabase/types';

type Props = {
  prompt: PromptWithDetails;
  locale: string;
  currentUserId?: string;
  initialStarred?: boolean;
};

function timeAgo(dateStr: string, locale: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (locale === 'tr') {
    if (mins < 60) return `${mins}d önce`;
    if (hours < 24) return `${hours}s önce`;
    return `${days}g önce`;
  }
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default function PromptCard({ prompt, locale, currentUserId, initialStarred = false }: Props) {
  const t = useTranslations('prompt');
  const router = useRouter();
  const supabase = createClient();
  const [starred, setStarred] = useState(initialStarred);
  const [starCount, setStarCount] = useState(prompt.star_count);
  const [loading, setLoading] = useState(false);

  const categoryName = locale === 'tr' ? prompt.categories.name_tr : prompt.categories.name_en;

  async function toggleStar(e: React.MouseEvent) {
    e.preventDefault();
    if (!currentUserId) {
      toast.error(locale === 'tr' ? 'Yıldızlamak için giriş yapın.' : 'Sign in to star prompts.');
      return;
    }
    setLoading(true);

    const newStarred = !starred;
    setStarred(newStarred);
    setStarCount((c) => newStarred ? c + 1 : Math.max(0, c - 1));

    if (!newStarred) {
      const { error } = await supabase.from('prompt_stars').delete().match({ user_id: currentUserId, prompt_id: prompt.id });
      if (error) { setStarred(true); setStarCount((c) => c + 1); toast.error('Error'); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('prompt_stars').insert({ user_id: currentUserId, prompt_id: prompt.id });
      if (error) { setStarred(false); setStarCount((c) => Math.max(0, c - 1)); toast.error('Error'); setLoading(false); return; }
    }

    const { data } = await supabase.from('prompts').select('star_count').eq('id', prompt.id).single();
    if (data) setStarCount(data.star_count);
    router.refresh();
    setLoading(false);
  }

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card className="group h-full flex flex-col transition-all duration-300 hover:shadow-md hover:border-border/80 relative overflow-hidden bg-card">
        <CardContent className="flex flex-col flex-1 p-4 relative z-10">
          {/* Category badge */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <Badge variant="secondary" className="text-xs shrink-0">
              {prompt.categories.icon} {categoryName}
            </Badge>
            {prompt.parent_id && (
              <Badge variant="outline" className="text-xs shrink-0 text-muted-foreground">
                <GitFork className="h-2.5 w-2.5 mr-1" />fork
              </Badge>
            )}
          </div>

          {/* Title & description */}
          <Link href={`/${locale}/prompts/${prompt.id}`} className="flex-1">
            <h3 className="font-semibold text-sm leading-snug mb-1 group-hover:text-primary transition-colors line-clamp-2">
              {prompt.title}
            </h3>
            {prompt.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">{prompt.description}</p>
            )}
          </Link>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-3 border-t">
            <Link
              href={`/${locale}/profile/${prompt.profiles.username}`}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity min-w-0"
            >
              <Avatar className="h-5 w-5 shrink-0">
                <AvatarImage src={prompt.profiles.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">{prompt.profiles.username[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate">{prompt.profiles.username}</span>
            </Link>

            <div className="flex items-center gap-2.5 text-xs text-muted-foreground shrink-0">
              {prompt.token_count > 0 && (
                <span className="hidden sm:flex items-center gap-1 font-mono text-blue-500 dark:text-blue-400">
                  ~{prompt.token_count.toLocaleString()} {t('tokens')}
                </span>
              )}
              <span className="hidden sm:flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo(prompt.created_at, locale)}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-3 w-3" /> {prompt.fork_count}
              </span>
              <button
                onClick={toggleStar}
                disabled={loading}
                className={`flex items-center gap-1 transition-colors hover:text-yellow-500 disabled:opacity-50 ${starred ? 'text-yellow-500' : ''}`}
              >
                <Star className={`h-3 w-3 ${starred ? 'fill-yellow-400' : ''}`} />
                {starCount}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
