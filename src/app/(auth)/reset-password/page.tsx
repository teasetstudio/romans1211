'use client'

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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

interface IFormValues {
  password: string;
  confirmPassword: string;
}

export default function ResetPasswordPage() {
  const t = useTranslations(NAMESPACE_COMMON);
  const { getErrorMessage } = useErrorMessage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [reqState, setReqState] = useState({
    loading: false,
    error: '',
  });
  const { loading, error } = reqState;

  const schema = yup.object({
    password: yup.string().min(8).required(),
    confirmPassword: yup.string()
      .oneOf([yup.ref('password')], t('error.passwords_must_match'))
      .required(),
  });

  const methods = useForm<IFormValues>({
    resolver: yupResolver(schema),
  });

  const { handleSubmit } = methods;

  const onSubmit = async (data: IFormValues) => {
    if (!token) {
      setReqState({
        loading: false,
        error: 'Invalid reset token',
      });
      return;
    }

    setReqState({ loading: true, error: '' });

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error);
      }

      // Redirect to login page after successful password reset
      router.push('/login');
    } catch (error) {
      setReqState({
        loading: false,
        error: getErrorMessage(error),
      });
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray6 p-4">
        <div className="w-full max-w-lg space-y-4 bg-white p-12 rounded-[36px] border border-gray3">
          <div className="text-center">
            <H9 color="text-danger" className="mb-4">
              {t('auth.invalid_reset_token')}
            </H9>
            <Link href="/forgot-password" className="text-primary hover:underline">
              {t('auth.request_new_link')}
            </Link>
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
          <H2>{t('auth.reset_password')}</H2>
        </div>

        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-6">
              <H9 className="mb-3">{t('auth.new_password')}</H9>
              <Input
                {...methods.register('password')}
                type="password"
                placeholder={t('auth.new_password')}
              />

              <H9 className="mb-3 mt-5">{t('auth.confirm_password')}</H9>
              <Input
                {...methods.register('confirmPassword')}
                type="password"
                placeholder={t('auth.confirm_password')}
              />

              {error && (
                <H9 color="text-danger" className="mt-3 text-center">
                  {error}
                </H9>
              )}
            </div>

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
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
