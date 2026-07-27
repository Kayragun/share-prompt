import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { createClient, getUser } from '@/lib/supabase/server';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata() {
  const t = await getTranslations('settings');
  return { title: t('title') };
}

export default async function ProfileSettingsPage({ params }: Props) {
  const { locale } = await params;
  const user = await getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, profession, education, description, show_profession, show_education')
    .eq('id', user.id)
    .single();

  if (!profile) redirect(`/${locale}`);

  return (
    <div className="py-4">
      <ProfileSettingsForm locale={locale} profile={profile} />
    </div>
  );
}
