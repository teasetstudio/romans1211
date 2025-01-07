import React from 'react'
import { useTranslations } from 'next-intl';

import Button from '@/components/buttons/Button'
import H3 from '@/components/typo/H3'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'
import Gradient from '@/components/ui/Gradient'
import { NAMESPACE_BANNERS } from '@/res/namespaces'
import { ROUTE_LIBRARY } from '@/res/routes'

import BannerWrapper from './BannerWrapper'
import H5 from '../typo/H5';

const SongsBanner = () => {
  const t = useTranslations(NAMESPACE_BANNERS)

  return (
    <BannerWrapper className="relative overflow-hidden">
      <div className="md:grid md:grid-cols-2 md:pb-0 md:pt-0 flex flex-col-reverse items-center pb-10 pt-4 relative z-10 gap-8 md:gap-0">
        <div className="flex flex-col md:pt-10 md:pb-14 md:w-full items-center md:items-start">
          <H3
            color="text-white"
            fontSize="text-3xl"
            className="sm:mb-7 sm:mt-0 mt-9 mb-3"
          >
            {t('songs.title')}
          </H3>
          <H8
            color="text-gray2"
            fontSize="text-tiny"
            className="md:text-left text-center"
          >
            {t('songs.description')}
          </H8>
          <Button
            href={`${ROUTE_LIBRARY}?type=song`}
            className="mt-10"
            size="md"
            bgColor="bg-gray4"
          >
            <H9 weight="semibold">{t('songs.btn_label')}</H9>
          </Button>
        </div>

        <div className="w-full flex justify-center md:justify-end">
          <div className="max-w-md w-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm rounded-2xl p-8 shadow-[-13px_20px_18px_rgb(0,0,0,0.85)] border border-white/10">
            <H5 color="text-white" className="text-center font-semibold leading-relaxed">
              {t('top_banner.ephesians_5_19')}
            </H5>
            <div className="text-right mt-4">
              <H8 color="text-gray3" className="italic">{t('top_banner.ref_ephesians_5_19')}</H8>
            </div>
          </div>
        </div>
      </div>

      <Gradient className="top-[-1300px] right-[-450px] z-0 w-[1700px] h-[2000px]" />
    </BannerWrapper>
  )
}

export default SongsBanner
