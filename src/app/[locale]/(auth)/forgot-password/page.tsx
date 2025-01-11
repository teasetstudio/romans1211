'use client'

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

import Button from '@/components/buttons/Button';
import Input from '@/components/inputs/Input';
import H2 from '@/components/typo/H2';
import H9 from '@/components/typo/H9';
import Spinner from '@/components/ui/Spinner';
import { NAMESPACE_COMMON } from '@/res/namespaces';
import useErrorMessage from '@/hooks/useErrorMessage';
import { ROUTE_LOGIN } from '@/res/routes';

interface IFormValues {
  email: string;
}

export default function ForgotPasswordPage() {
  const t = useTranslations(NAMESPACE_COMMON);
  const { getErrorMessage } = useErrorMessage();

  const [reqState, setReqState] = useState({
    loading: false,
    error: '',
    success: false,
  });
  const { loading, error, success } = reqState;

  const schema = yup.object({
    email: yup.string().email().required(),
  });

  const methods = useForm<IFormValues>({
    resolver: yupResolver(schema),
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: IFormValues) => {
    setReqState({ loading: true, error: '', success: false });

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      setReqState({
        loading: false,
        error: '',
        success: true,
      });
    } catch (error) {
      setReqState({
        loading: false,
        error: getErrorMessage(error),
        success: false,
      });
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray6 p-4">
        <div className="w-full max-w-lg space-y-4 bg-white p-12 rounded-[36px] border border-gray3">
          <div className="text-center py-8">
            <H9 color="text-success" className="mb-4">
              {t('auth.reset_email_sent')}
            </H9>
            <H9 className="mb-4">
              {t('auth.check_email_reset')}
            </H9>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray6 p-4">
      <div className="w-full max-w-lg space-y-4 bg-white p-12 rounded-[36px] border border-gray3">
        <div className="text-right mb-2">
          <Link href="/" className="text-primary hover:underline">
            {t('home')}
          </Link>
        </div>
        <div className="text-center mb-8">
          <H2>{t('auth.forgot_password')}</H2>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <H9 className="mb-3">{t('auth.email_address')}</H9>
              <Input
                {...methods.register('email')}
                type="text"
                placeholder={t('auth.email_address')}
              />
              {error && (
                <H9 color="text-danger" className="mt-3 text-center">
                  {error}
                </H9>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              {loading ? <Spinner /> :
                <Button
                  type="submit"
                  disabled={loading}
                  paddingClass="py-3"
                  rounded="rounded-lg"
                  className="w-full"
                  bgColor="bg-primary"
                >

                  <H9 color="text-white" weight="semibold">
                    {t('auth.reset_password')}
                  </H9>
                </Button>
              }

              <div className="text-center">
                <Link href={ROUTE_LOGIN} className="text-primary hover:underline">
                  {t('auth.back_to_login')}
                </Link>
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
