import { useTranslations } from 'next-intl';
import React from 'react'

import { NAMESPACE_BANNERS } from '@/res/namespaces'
import { ROUTE_LIBRARY } from '@/res/routes'

import MaterialTypeCard from './MaterialTypeCard'

const matTypesList = [
  {
    mediaType: 'mat_types.text.title',
    description: 'mat_types.text.description',
    ctaLabel: 'mat_types.text.btn_label',
    url: `${ROUTE_LIBRARY}?type=text`,
  },
  {
    mediaType: 'mat_types.song.title',
    description: 'mat_types.song.description',
    ctaLabel: 'mat_types.song.btn_label',
    url: `${ROUTE_LIBRARY}?type=song`,
  },
  {
    mediaType: 'mat_types.game.title',
    description: 'mat_types.game.description',
    ctaLabel: 'mat_types.game.btn_label',
    url: `${ROUTE_LIBRARY}?type=game`,
  },
]

const MediaTypesBanner = () => {
  const t = useTranslations(NAMESPACE_BANNERS)
  return (
    <div className="container-full">
      <div className="grid lg:grid-cols-3 gap-3 lg:gap-6">
        {matTypesList.map(({ mediaType, url, description, ctaLabel }) => (
          <MaterialTypeCard
            key={url}
            mediaType={t(mediaType)}
            url={url}
            description={t(description)}
            ctaLabel={t(ctaLabel)}
          />
        ))}
      </div>
    </div>
  )
}

export default MediaTypesBanner
