import { yupResolver } from '@hookform/resolvers/yup'
import { useTranslations } from 'next-intl';
import { useState } from 'react'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import * as yup from 'yup'
import { signIn } from 'next-auth/react'

import Button from '@/components/buttons/Button'
import Input from '@/components/inputs/Input'
import H9 from '@/components/typo/H9'
import Spinner from '@/components/ui/Spinner'
import useErrorMessage from '@/hooks/useErrorMessage'
import { NAMESPACE_COMMON, NAMESPACE_ERRORS } from '@/res/namespaces'
import TextButton from '@/components/buttons/TextButton';
import { IconGoogle } from '@/res/icons';

interface IFormValues {
  name: string
  email: string
  password: string
}

const RegisterForm = () => {
  const t = useTranslations(NAMESPACE_COMMON)
  const te = (e: string) => t(`${NAMESPACE_ERRORS}.${e}`)
  const { getErrorMessage } = useErrorMessage()

  const [reqState, setReqState] = useState({
    loading: false,
    error: '',
    success: false,
  })
  const { loading, error, success } = reqState

  const schema = yup.object({
    name: yup.string().required(te('required')),
    email: yup.string().email().required(te('required')),
    password: yup.string().min(8, te('minimum_8')).required(te('required')),
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
      success: false,
    })

    try {
      // First register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Registration failed')
      }

      setReqState({
        loading: false,
        error: '',
        success: true,
      })

      // Clear the form
      reset()

    } catch (error) {
      const errMessage = getErrorMessage(error)
      setReqState({
        loading: false,
        error: errMessage,
        success: false,
      })
      reset()
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <H9 color="text-success" className="mb-4">
          {t('auth.registration_success')}
        </H9>
        <H9 className="mb-4">
          {t('auth.verification_email_sent')}
        </H9>
        <H9>
          {t('auth.check_email')}
        </H9>
      </div>
    )
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
        success: false,
      })
      reset()
    }
  }

  return (
    <FormProvider {...methods}>
      <div className='relative'>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 sm:mb-5">
            <H9 className="mb-3 mt-8">{t('auth.name')}</H9>
            <Input name="name" placeholder={t('auth.name')} />

            <H9 className="mb-3 mt-5">{t('auth.email_address')}</H9>
            <Input name="email" placeholder={t('auth.email_address')} />

            <H9 className="mb-3 mt-5">{t('auth.password')}</H9>
            <Input
              type="password"
              name="password"
              placeholder={t('auth.password')}
            />
            {error && (
              <H9 color="text-danger" className="my-3 text-center">
                {error}
              </H9>
            )}
          </div>

          <div className="flex flex-row-reverse justify-between items-center">
            {loading ? (
              <Spinner />
            ) : (
              <>
                <Button
                  type="submit"
                  paddingClass="py-3"
                  rounded="rounded-lg"
                  className="w-full sm:w-40"
                  bgColor="bg-primary"
                  onClick={() => null}
                >
                  <H9 color="text-white" weight="semibold">
                    {t('auth.sign_up')}
                  </H9>
                </Button>
              </>
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
                {t('auth.signup_google')}
              </H9>
            </TextButton>
          </div>
        </div>
      </div>
    </FormProvider>
  )
}

export default RegisterForm
