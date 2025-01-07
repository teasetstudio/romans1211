'use client'

import Link from 'next/link'

import { IconPlus } from '@/res/icons'
import H9 from '../typo/H9'
import { ROUTE_DASHBOARD_MATERIAL_CREATE, ROUTE_REGISTER } from '@/res/routes'
import { useSession } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { NAMESPACE_COMMON } from '@/res/namespaces'

function CreateMaterialButton() {
  const { data: session } = useSession()
  const t = useTranslations(NAMESPACE_COMMON)

  return (
    <Link 
      href={session ? ROUTE_DASHBOARD_MATERIAL_CREATE : ROUTE_REGISTER}
      className="flex items-center gap-2 px-4 py-2 bg-primary rounded-lg hover:bg-primary/90 transition-colors"
    >
      {session ? (
        <>
          <IconPlus className="w-4 h-4 text-white" />
          <H9 color="text-white">{t('header.create_material')}</H9>
        </>
      ) : (
        <H9 color="text-white">{t('auth.sign_up')}</H9>
      )}
    </Link>
  )
}

export default CreateMaterialButton
