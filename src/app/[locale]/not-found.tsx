import { useTranslations } from 'next-intl'
import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { NAMESPACE_NOT_FOUND } from '@/res/namespaces';

export default function NotFound() {
  const t = useTranslations(NAMESPACE_NOT_FOUND)

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-6">{t('title')}</h2>
        <p className="text-gray-600 mb-8">{t('description')}</p>
        <Link
          href='/'
          className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
        >
          {t('back_home')}
        </Link>
      </div>
    </div>
  )
}
