import { getTranslations } from 'next-intl/server';
import { getUser, getProfile } from '@/lib/supabase/server';
import NavbarClient from './NavbarClient';

export default async function Navbar({ locale }: { locale: string }) {
  const [user, profile, t] = await Promise.all([getUser(), getProfile(), getTranslations('nav')]);

  return (
    <NavbarClient
      locale={locale}
      user={user ? { id: user.id, email: user.email ?? '' } : null}
      profile={profile}
      messages={{
        home: t('home'),
        categories: t('categories'),
        newPrompt: t('newPrompt'),
        starred: t('starred'),
        login: t('login'),
        register: t('register'),
        logout: t('logout'),
        profile: t('profile'),
        faq: t('faq'),
      }}
    />
  );
}
