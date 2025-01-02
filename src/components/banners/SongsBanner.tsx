import Image from 'next/image'
import React from 'react'
import { useTranslations } from 'next-intl';

import Button from '@/components/buttons/Button'
import H3 from '@/components/typo/H3'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'
import Gradient from '@/components/ui/Gradient'
import { ImgOnlineAds } from '@/res/images'
import { NAMESPACE_BANNERS } from '@/res/namespaces'
import { ROUTE_LIBRARY } from '@/res/routes'

import BannerWrapper from './BannerWrapper'

const SongsBanner = () => {
  const t = useTranslations(NAMESPACE_BANNERS)

  return (
    <BannerWrapper className="relative overflow-hidden">
      <div className="md:grid md:grid-cols-2 md:pb-0 md:pt-0 flex flex-col-reverse items-center pb-14 pt-6 relative z-10">
        <div className="flex flex-col md:pt-16 md:pb-20 md:w-full items-center md:items-start">
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

        <div className="flex justify-center items-center">
          <Image
            src={ImgOnlineAds}
            alt="online ads" />
        </div>
      </div>

      <Gradient className="top-[-1300px] right-[-450px] z-0 w-[1700px] h-[2000px]" />
    </BannerWrapper>
  )
}

export default SongsBanner
