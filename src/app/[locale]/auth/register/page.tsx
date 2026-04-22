'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Zap } from 'lucide-react';

export default function RegisterPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [form, setForm] = useState({
    email: '', password: '', firstName: '', lastName: '', username: '', profession: '', education: '', description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.validity.valueMissing) target.setCustomValidity(t('requiredError'));
    else if (target.validity.typeMismatch) target.setCustomValidity(t('invalidEmail'));
    else if (target.validity.tooShort) target.setCustomValidity(t('passwordTooShort'));
  };

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { username: form.username, full_name: `${form.firstName} ${form.lastName}`.trim() } },
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    const { data: { user: newUser } } = await supabase.auth.getUser();
    if (newUser && (form.profession || form.education || form.description)) {
      await (supabase.from('profiles') as ReturnType<typeof supabase.from>)
        .update({ profession: form.profession || null, education: form.education || null, description: form.description || null } as Record<string, unknown>)
        .eq('id', newUser.id);
    }

    toast.success(t('accountCreated'));
    router.push(`/${locale}`);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh] py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary mb-4">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">{t('registerTitle')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('registerSubtitle')}</p>
        </div>

        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <form onSubmit={handleRegister} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">{t('firstName')} <span className="text-destructive">*</span></Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => { e.target.setCustomValidity(''); update('firstName', e.target.value); }} onInvalid={handleInvalid} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">{t('lastName')} <span className="text-destructive">*</span></Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => { e.target.setCustomValidity(''); update('lastName', e.target.value); }} onInvalid={handleInvalid} required />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="username">{t('username')} <span className="text-destructive">*</span></Label>
              <Input id="username" value={form.username} onChange={(e) => { e.target.setCustomValidity(''); update('username', e.target.value); }} onInvalid={handleInvalid} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')} <span className="text-destructive">*</span></Label>
              <Input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => { e.target.setCustomValidity(''); update('email', e.target.value); }} onInvalid={handleInvalid} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('password')} <span className="text-destructive">*</span></Label>
              <Input id="password" type="password" placeholder="••••••••" value={form.password} onChange={(e) => { e.target.setCustomValidity(''); update('password', e.target.value); }} onInvalid={handleInvalid} required minLength={6} />
            </div>
            <div className="pt-1 border-t">
              <p className="text-xs text-muted-foreground mb-2">{t('optionalProfile')}</p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="profession">{t('profession')}</Label>
                  <Input id="profession" value={form.profession} onChange={(e) => update('profession', e.target.value)} placeholder={t('professionPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="education">{t('education')}</Label>
                  <Input id="education" value={form.education} onChange={(e) => update('education', e.target.value)} placeholder={t('educationPlaceholder')} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="description">{t('description')}</Label>
                  <Textarea id="description" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder={t('descriptionPlaceholder')} className="resize-none h-20" />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('registering') : t('registerButton')}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-sm text-center text-muted-foreground">
          {t('hasAccount')}{' '}
          <Link href="login" className="text-primary font-medium hover:underline">
            {t('loginLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
