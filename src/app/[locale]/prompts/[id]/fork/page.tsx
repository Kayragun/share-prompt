import { notFound, redirect } from 'next/navigation';
import { createClient, getUser } from '@/lib/supabase/server';
import PromptForm from '@/components/prompts/PromptForm';

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function ForkPromptPage({ params }: Props) {
  const { locale, id } = await params;
  const supabase = await createClient();

  const user = await getUser();
  if (!user) redirect(`/${locale}/auth/login`);

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single();

  if (!prompt) notFound();

  const { data: categories } = await supabase.from('categories').select('*').order('id');

  return (
    <div className="py-4">
      <PromptForm
        locale={locale}
        categories={categories ?? []}
        userId={user.id}
        parentId={id}
        isFork
        defaultValues={{
          title: prompt.title,
          description: prompt.description ?? '',
          content: prompt.content,
          categoryId: prompt.category_id,
        }}
      />
    </div>
  );
}
