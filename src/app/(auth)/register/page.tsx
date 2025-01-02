'use client'

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import RegisterForm from '@/components/popups/AuthPopup/RegisterForm'
import H2 from '@/components/typo/H2';
import H9 from '@/components/typo/H9';
import { NAMESPACE_COMMON } from '@/res/namespaces';

export default function RegisterPage() {
  const t = useTranslations(NAMESPACE_COMMON)
  const router = useRouter()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray6 p-4">
      <div className="w-full max-w-lg space-y-4 bg-white p-12 rounded-[36px] border border-gray3">
        <div className="text-right mb-2">
          <Link href="/" className="text-primary hover:underline">
            {t('home')}
          </Link>
        </div>
        <div className="text-center mb-8">
          <H2>{t('auth.register')}</H2>
        </div>
        <RegisterForm />
        <div className="text-center pt-4">
          <H9 className="text-gray1">
            {t('auth.have_account')}{' '}
            <Link href="/login" className="text-primary hover:underline">
              {t('auth.log_in')}
            </Link>
          </H9>
        </div>
      </div>
    </div>
  )
}
