import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { LogoMark } from './Logo';
import { getUser, getProfile } from '@/lib/supabase/server';

export default async function Footer({ locale }: { locale: string }) {
  const [tNav, user, profile] = await Promise.all([getTranslations('nav'), getUser(), getProfile()]);
  const username = profile?.username ?? null;

  return (
    <footer className="border-t mt-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-semibold text-foreground">
          <LogoMark className="h-5 w-5" />
          SharePrompt
        </Link>
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/categories`} className="hover:text-foreground transition-colors">{tNav('categories')}</Link>
          <Link href={`/${locale}/faq`} className="hover:text-foreground transition-colors">{tNav('faq')}</Link>
          {user && username ? (
            <Link href={`/${locale}/profile/${username}`} className="hover:text-foreground transition-colors">{tNav('profile')}</Link>
          ) : (
            <Link href={`/${locale}/auth/register`} className="hover:text-foreground transition-colors">{tNav('register')}</Link>
          )}
        </div>
        <p>© {new Date().getFullYear()} SharePrompt</p>
      </div>
    </footer>
  );
}
