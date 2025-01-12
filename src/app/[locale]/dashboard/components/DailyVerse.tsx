import { useTranslations } from 'next-intl';
import { NAMESPACE_DASHBOARD } from '@/res/namespaces';

export const DailyVerse = () => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  return (
    <div className="bg-primary/10 rounded-3xl p-4 border border-primary/20 shadow-[0_2px_12px_rgba(0,0,0,0.1)] mb-4">
      <p className="text-xl font-medium text-primary mb-2 text-center">&quot;{t('romans_12_11')}&quot;</p>
      <p className="text-sm text-right text-secondary/50 font-medium italic">{t('romans_12_11_ref')}</p>
    </div>
  );
};
