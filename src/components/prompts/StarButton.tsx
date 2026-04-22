'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type Props = {
  promptId: string;
  initialStarred: boolean;
  initialCount: number;
  currentUserId?: string;
};

export default function StarButton({ promptId, initialStarred, initialCount, currentUserId }: Props) {
  const t = useTranslations('prompt');
  const router = useRouter();
  const supabase = createClient();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!currentUserId) {
      toast.error('Yıldızlamak için giriş yapın.');
      return;
    }
    setLoading(true);

    const newStarred = !starred;
    setStarred(newStarred);
    setCount((c) => newStarred ? c + 1 : Math.max(0, c - 1));

    if (!newStarred) {
      const { error } = await supabase.from('prompt_stars').delete().match({ user_id: currentUserId, prompt_id: promptId });
      if (error) { setStarred(true); setCount((c) => c + 1); toast.error('Hata oluştu.'); setLoading(false); return; }
    } else {
      const { error } = await supabase.from('prompt_stars').insert({ user_id: currentUserId, prompt_id: promptId });
      if (error) { setStarred(false); setCount((c) => Math.max(0, c - 1)); toast.error('Hata oluştu.'); setLoading(false); return; }
    }

    const { data } = await supabase.from('prompts').select('star_count').eq('id', promptId).single();
    if (data) setCount(data.star_count);
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      disabled={loading}
      className="gap-1.5"
    >
      <Star className={`h-4 w-4 ${starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      {starred ? t('unstar') : t('star')} · {count}
    </Button>
  );
}
