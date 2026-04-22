import { useTranslations } from 'next-intl';
import { Zap } from 'lucide-react';

type Props = {
  promptCount: number;
  totalStars: number;
};

export default function ContributionScore({ promptCount, totalStars }: Props) {
  const t = useTranslations('profile');
  const points = promptCount * 10 + totalStars * 5;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
      <Zap className="h-4 w-4 text-primary" />
      <span className="font-semibold text-primary">{points}</span>
      <span className="text-sm text-muted-foreground">{t('contributionPoints')}</span>
    </div>
  );
}
