import { redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';
import PromptForm from '@/components/prompts/PromptForm';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function NewPromptPage({ params }: Props) {
  const { locale } = await params;
  const supabase = await createClient();

  const user = await getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: categories } = await supabase.from('categories').select('*').order('id');

  return (
    <div className="py-4">
      <PromptForm
        locale={locale}
        categories={categories ?? []}
        userId={user.id}
      />
    </div>
  );
}
