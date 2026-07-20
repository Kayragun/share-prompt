'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { LogoMark } from '@/components/layout/Logo';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const locale = useLocale();
  const supabase = createClient();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInvalid = (e: React.InvalidEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.validity.valueMissing) target.setCustomValidity(t('requiredError'));
    else if (target.validity.typeMismatch) target.setCustomValidity(t('invalidEmail'));
    else if (target.validity.tooShort) target.setCustomValidity(t('passwordTooShort'));
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      router.push(`/${locale}`);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <LogoMark className="inline-block h-12 w-12 mb-4" />
          <h1 className="text-2xl font-bold">{t('loginTitle')}</h1>
          <p className="text-muted-foreground text-sm mt-1">{t('loginSubtitle')}</p>
        </div>

        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { e.target.setCustomValidity(''); setEmail(e.target.value); }}
                onInvalid={handleInvalid}
                placeholder="you@example.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { e.target.setCustomValidity(''); setPassword(e.target.value); }}
                onInvalid={handleInvalid}
                placeholder="••••••••"
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('loggingIn') : t('loginButton')}
            </Button>
          </form>
        </div>

        <p className="mt-4 text-sm text-center text-muted-foreground">
          {t('noAccount')}{' '}
          <Link href="register" className="text-primary font-medium hover:underline">
            {t('registerLink')}
          </Link>
        </p>
      </div>
    </div>
  );
}
