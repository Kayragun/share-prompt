import { getTranslations } from 'next-intl/server';
import { createClient } from '@/lib/supabase/server';
import NavbarClient from './NavbarClient';

export default async function Navbar({ locale }: { locale: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();
    profile = data;
  }

  const t = await getTranslations('nav');

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
