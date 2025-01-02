"use client"

import AdButton from '@/components/buttons/AdButton'
import { NAMESPACE_BANNERS } from '@/res/namespaces'
import { useTranslations } from 'next-intl'
import { IconPencilCirlce, IconUser } from '@/res/icons'
import React from 'react'
import { ROUTE_DASHBOARD_MATERIAL_CREATE, ROUTE_LOGIN } from '@/res/routes'
import { useSession } from 'next-auth/react'

const ClientTopBannerBtn = () => {
  const t = useTranslations(NAMESPACE_BANNERS)
  const { data: session } = useSession()

  const label = session ? t('top_banner.create') : t('top_banner.log_in')
  const route = session ? ROUTE_DASHBOARD_MATERIAL_CREATE : ROUTE_LOGIN
  const Icon = session ? IconPencilCirlce : IconUser

  return (
    <AdButton
      bgColor="bg-white"
      color="text-secondary"
      icon={Icon}
      iconColor="secondary"
      title={label}
      href={route}
    />
  )
}

export default ClientTopBannerBtn