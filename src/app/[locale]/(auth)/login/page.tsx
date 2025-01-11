import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

import LoginForm from '@/components/popups/AuthPopup/LoginForm'
import H2 from '@/components/typo/H2';
import H9 from '@/components/typo/H9';
import { NAMESPACE_COMMON } from '@/res/namespaces';
import { ROUTE_REGISTER } from '@/res/routes';

export default function Login() {
  const t = useTranslations(NAMESPACE_COMMON)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray6 p-4">
      <div className="w-full max-w-lg space-y-4 bg-white p-12 rounded-[36px] border border-gray3">
        <div className="text-right mb-2">
          <Link href="/" className="text-primary hover:underline">
            {t('home')}
          </Link>
        </div>
        <div className="text-center mb-8">
          <H2>{t('auth.log_in')}</H2>
        </div>
        <LoginForm redirectAfterLoginURL='/' />
        <div className="text-center pt-4">
          <H9 className="text-gray1">
            {t('auth.no_account')}{' '}
            <Link href={ROUTE_REGISTER} className="text-primary hover:underline">
              {t('auth.register')}
            </Link>
          </H9>
        </div>
      </div>
    </div>
  )
}
