import { getTranslations } from 'next-intl/server';
import FaqSection from '@/components/home/FaqSection';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'faq' });
  return { title: t('title') };
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto py-4">
      <FaqSection />
    </div>
  );
}
