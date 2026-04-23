'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

type Props = {
  promptId: string;
  locale: string;
};

export default function DeletePromptButton({ promptId, locale }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations('prompt');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 4000);
      return;
    }

    setLoading(true);
    const { error } = await supabase.from('prompts').delete().eq('id', promptId);

    if (error) {
      toast.error(t('deleteFailed') + ': ' + error.message);
      setLoading(false);
      return;
    }

    toast.success(t('deleteSuccess'));
    router.push(`/${locale}`);
    router.refresh();
  }

  return (
    <Button
      variant={confirm ? 'destructive' : 'outline'}
      size="sm"
      onClick={handleDelete}
      disabled={loading}
      className="gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {loading ? t('deleting') : confirm ? t('deleteConfirm') : t('delete')}
    </Button>
  );
}
