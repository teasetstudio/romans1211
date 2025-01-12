"use client"

import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations } from 'next-intl';
import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/i18n/routing';
import Button from '@/components/buttons/Button'
import TextButton from '@/components/buttons/TextButton'
import Input from '@/components/inputs/Input'
import H9 from '@/components/typo/H9'
import Spinner from '@/components/widgets/ui/Spinner'
import useErrorMessage from '@/hooks/useErrorMessage'
import { NAMESPACE_COMMON } from '@/res/namespaces';
import { IconGoogle } from '@/res/icons';

interface IFormValues {
  email: string
  password: string
}

interface LoginFormProps {
  redirectAfterLoginURL?: string
}

const LoginForm = ({ redirectAfterLoginURL }: LoginFormProps) => {
  const t = useTranslations(NAMESPACE_COMMON)
  const { getErrorMessage } = useErrorMessage()
  const router = useRouter()

  const [reqState, setReqState] = useState({
    loading: false,
    error: '',
  })
  const { loading, error } = reqState

  const schema = yup.object({
    email: yup.string().email().required(),
    password: yup.string().required(),
  })

  const methods = useForm<IFormValues>({
    mode: 'onBlur',
    resolver: yupResolver(schema),
  })

  const { handleSubmit, reset } = methods

  const onSubmit: SubmitHandler<IFormValues> = async (data) => {
    setReqState({
      loading: true,
      error: '',
    })

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setReqState({
          loading: false,
          error: result.error,
        })
        reset()
        return
      }

      // Handle redirect after successful login
      if (redirectAfterLoginURL) {
        router.push(redirectAfterLoginURL)
      }
    } catch (error) {
      const errMessage = getErrorMessage(error)
      setReqState({
        loading: false,
        error: errMessage,
      })
      reset()
    }
  }

  const onGoogleSubmit = async () => {
    if (loading) return
    try {
      await signIn('google', { redirect: false })
    } catch (error) {
      const errMessage = getErrorMessage(error)
      setReqState({
        loading: false,
        error: errMessage,
      })
      reset()
    }
  }

  return (
    <FormProvider {...methods}>
      <div className='relative'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="h-80">
            <H9 className="mb-3 pt-8">{t('auth.email_address')}</H9>
            <Input name="email" placeholder={t('auth.email_address')} />

            <H9 className="mb-3 mt-5">{t('auth.password')}</H9>
            <Input
              type="password"
              name="password"
              placeholder={t('auth.password')}
            />
            {error && (
              <H9 color="text-danger" className="mt-5 text-center">
                {error}
              </H9>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-between items-center">
            <TextButton
              href="/forgot-password"
              className="hover:underline mt-7 sm:mt-0"
            >
              <H9 color="text-secondary" weight="semibold">
                {t('auth.forgot_password')}
              </H9>
            </TextButton>

            {loading ? (
              <Spinner />
            ) : (
              <Button
                type="submit"
                paddingClass="py-3"
                rounded="rounded-lg"
                className="w-full sm:w-40"
                bgColor="bg-primary"
                onClick={() => null}
              >
                <H9 color="text-white" weight="semibold">
                  {t('auth.log_in')}
                </H9>
              </Button>
            )}
          </div>
        </form>

        <div className="relative mt-10">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center">
            <TextButton
              onClick={onGoogleSubmit}
              className="bg-white px-4 hover:underline flex items-center gap-2"
            >
              <IconGoogle className="text-primary" />
              <H9 color="text-secondary" weight="semibold">
                {t('auth.signin_google')}
              </H9>
            </TextButton>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default LoginForm
