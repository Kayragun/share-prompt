'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Star } from 'lucide-react';
import { toast } from 'sonner';

type Props = {
  promptId: string;
  initialStarred: boolean;
  initialCount: number;
  currentUserId?: string;
};

export default function ForkStarButton({ promptId, initialStarred, initialCount, currentUserId }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [starred, setStarred] = useState(initialStarred);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!currentUserId) {
      toast.error('Yıldızlamak için giriş yapın.');
      return;
    }
    setLoading(true);

    // Optimistik güncelleme — anında göster
    const newStarred = !starred;
    setStarred(newStarred);
    setCount((c) => newStarred ? c + 1 : Math.max(0, c - 1));

    if (!newStarred) {
      const { error } = await supabase
        .from('prompt_stars')
        .delete()
        .match({ user_id: currentUserId, prompt_id: promptId });
      if (error) {
        // Geri al
        setStarred(true);
        setCount((c) => c + 1);
        toast.error('Hata oluştu.');
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase
        .from('prompt_stars')
        .insert({ user_id: currentUserId, prompt_id: promptId });
      if (error) {
        // Geri al
        setStarred(false);
        setCount((c) => Math.max(0, c - 1));
        toast.error('Hata oluştu.');
        setLoading(false);
        return;
      }
    }

    // DB'den gerçek sayıyı al ve güncelle
    const { data } = await supabase
      .from('prompts')
      .select('star_count')
      .eq('id', promptId)
      .single();

    if (data) setCount(data.star_count);
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-yellow-500 transition-colors disabled:opacity-50 shrink-0"
    >
      <Star className={`h-3.5 w-3.5 ${starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      {count}
    </button>
  );
}
