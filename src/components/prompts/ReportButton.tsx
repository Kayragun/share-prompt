'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Dialog } from '@base-ui/react/dialog';
import { Flag } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  promptId: string;
  currentUserId?: string;
  showLabel?: boolean;
};

export default function ReportButton({ promptId, currentUserId, showLabel = false }: Props) {
  const t = useTranslations('prompt');
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  function handleTriggerClick(e: React.MouseEvent) {
    e.preventDefault();
    if (!currentUserId) {
      toast.error(t('reportSignIn'));
      return;
    }
    setOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) return;
    setLoading(true);

    const { error } = await supabase.from('prompt_reports').insert({
      prompt_id: promptId,
      reporter_id: currentUserId,
      reason: reason.trim(),
    });

    setLoading(false);

    if (error?.code === '23505') {
      toast.error(t('reportAlreadyReported'));
      setOpen(false);
      setReason('');
    } else if (error) {
      toast.error(t('reportError'));
    } else {
      toast.success(t('reportSuccess'));
      setOpen(false);
      setReason('');
    }
  }

  return (
    <>
      <button
        onClick={handleTriggerClick}
        className={`flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors${showLabel ? ' gap-1.5' : ''}`}
        aria-label={t('report')}
      >
        <Flag className={showLabel ? 'h-4 w-4' : 'h-3 w-3'} />
        {showLabel && <span>{t('report')}</span>}
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/50 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0" />
          <Dialog.Popup className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-background p-6 shadow-lg outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95">
            <Dialog.Title className="text-base font-semibold mb-1">{t('reportTitle')}</Dialog.Title>
            <Dialog.Description className="text-sm text-muted-foreground mb-4">{t('reportDescription')}</Dialog.Description>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('reportPlaceholder')}
                className="min-h-[100px] resize-none"
                maxLength={500}
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground text-right">{reason.length}/500</p>
              <div className="flex gap-2 justify-end">
                <Dialog.Close className="inline-flex items-center justify-center rounded-md text-sm font-medium px-3 py-1.5 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                  {t('reportCancel')}
                </Dialog.Close>
                <Button type="submit" variant="destructive" size="sm" disabled={loading || !reason.trim()}>
                  {loading ? '…' : t('reportSubmit')}
                </Button>
              </div>
            </form>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
