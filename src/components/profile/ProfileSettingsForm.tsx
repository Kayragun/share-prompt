'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';

type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  profession: string | null;
  education: string | null;
  description: string | null;
  show_profession: boolean;
  show_education: boolean;
};

export default function ProfileSettingsForm({ locale, profile }: { locale: string; profile: Profile }) {
  const t = useTranslations('settings');
  const router = useRouter();
  const supabase = createClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    full_name: profile.full_name ?? '',
    profession: profile.profession ?? '',
    education: profile.education ?? '',
    description: profile.description ?? '',
    show_profession: profile.show_profession,
    show_education: profile.show_education,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set<K extends keyof typeof form>(field: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function onAvatarSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error(t('avatarImageOnly'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('avatarTooLarge'));
      return;
    }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    let avatar_url = profile.avatar_url;

    // Yeni avatar seçildiyse yükle; başarısız olursa diğer alanlar yine kaydedilir.
    if (avatarFile) {
      const ext = avatarFile.name.split('.').pop();
      const path = `avatars/${profile.id}.${ext}`;
      const { data: up, error: upErr } = await supabase.storage
        .from('outputs')
        .upload(path, avatarFile, { upsert: true });
      if (upErr) {
        toast.error(t('avatarFailed'));
      } else {
        const { data: urlData } = supabase.storage.from('outputs').getPublicUrl(up.path);
        avatar_url = `${urlData.publicUrl}?t=${Date.now()}`;
      }
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim() || null,
        profession: form.profession.trim() || null,
        education: form.education.trim() || null,
        description: form.description.trim() || null,
        show_profession: form.show_profession,
        show_education: form.show_education,
        avatar_url,
      })
      .eq('id', profile.id);

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    toast.success(t('saved'));
    router.push(`/${locale}/profile/${profile.username}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <p className="text-sm text-muted-foreground mt-1">{t('subtitle')}</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          <AvatarImage src={avatarPreview ?? profile.avatar_url ?? undefined} />
          <AvatarFallback className="text-xl">{profile.username[0]?.toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-2">
            <Upload className="h-4 w-4" /> {t('changeAvatar')}
          </Button>
          <p className="text-xs text-muted-foreground mt-1.5">{t('avatarHint')}</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onAvatarSelect} />
      </div>

      {/* Kullanıcı adı (salt okunur) */}
      <div className="space-y-1">
        <Label htmlFor="username">{t('username')}</Label>
        <Input id="username" value={`@${profile.username}`} disabled />
        <p className="text-xs text-muted-foreground">{t('usernameNote')}</p>
      </div>

      <div className="space-y-1">
        <Label htmlFor="full_name">{t('fullName')}</Label>
        <Input
          id="full_name"
          value={form.full_name}
          onChange={(e) => set('full_name', e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          maxLength={80}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="profession">{t('profession')}</Label>
        <div className="flex items-center gap-3">
          <Input
            id="profession"
            value={form.profession}
            onChange={(e) => set('profession', e.target.value)}
            placeholder={t('professionPlaceholder')}
            maxLength={80}
          />
          <label className="flex items-center gap-2 shrink-0 cursor-pointer text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.show_profession}
              onChange={(e) => set('show_profession', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            {t('visible')}
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="education">{t('education')}</Label>
        <div className="flex items-center gap-3">
          <Input
            id="education"
            value={form.education}
            onChange={(e) => set('education', e.target.value)}
            placeholder={t('educationPlaceholder')}
            maxLength={80}
          />
          <label className="flex items-center gap-2 shrink-0 cursor-pointer text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={form.show_education}
              onChange={(e) => set('show_education', e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            {t('visible')}
          </label>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="description">{t('description')}</Label>
        <Textarea
          id="description"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
          placeholder={t('descriptionPlaceholder')}
          className="min-h-28"
          maxLength={500}
        />
        <p className="text-xs text-right text-muted-foreground">{form.description.length}/500</p>
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? t('saving') : t('save')}
        </Button>
        <Link
          href={`/${locale}/profile/${profile.username}`}
          className={cn(buttonVariants({ variant: 'outline' }))}
        >
          {t('cancel')}
        </Link>
      </div>
    </form>
  );
}
