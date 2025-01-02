import Image from 'next/image'
import { useTranslations } from 'next-intl';
import AdButton from '@/components/buttons/AdButton'
import H2 from '@/components/typo/H2'
import H7 from '@/components/typo/H7'
import Gradient from '@/components/ui/Gradient'
import { IconNewspaper } from '@/res/icons'
import { ImgNewsPaperCards } from '@/res/images'
import { NAMESPACE_BANNERS } from '@/res/namespaces'
import { ROUTE_LIBRARY } from '@/res/routes'
import ClientTopBannerBtn from './client-components/ClientTopBannerBtn';

interface IProps {
  className?: string
}

const TopBanner = ({ className = '' }: IProps) => {
  const t = useTranslations(NAMESPACE_BANNERS)

  return (
    <div
      className={`${className} bg-dark md:mr-0 md:ml-5 xl:ml-10 rounded-none md:rounded-l-[36px] md:rounded-r-none relative overflow-hidden`}
    >
      <div className="md:pr-5 xl:pr-10 relative z-20">
        <div className="container py-16 sm:py-20 lg:py-28">
          <div className="mt-40 md:mt-0 max-w-md md:max-w-none w-full md:w-7/12 lg:w-5/12 mx-auto md:mx-0 text-center md:text-left">
            <H2 color="text-white" className="mb-7">
              {t('top_banner.title')}
            </H2>

            <H7 color="text-gray2" className="mb-12">
              {t('top_banner.subtitle')}
            </H7>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-7 md:justify-start">
              <ClientTopBannerBtn />

              <AdButton
                bgColor="bg-transparent"
                color="text-white"
                icon={IconNewspaper}
                iconColor="gray4"
                title={t('top_banner.view_placements')}
                href={ROUTE_LIBRARY}
                className="border border-white hover:bg-gray1"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute top-0 right-1/2 translate-x-1/2 md:translate-x-0 md:-top-10 lg:top-0 md:-right-4 w-full md:w-1/2 h-60 md:h-full z-10">
        <div className="relative w-full h-full">
          <Image
            src={ImgNewsPaperCards}
            alt="newspaper"
            className="object-cover"
          />
        </div>
      </div>

      <Gradient className="opacity-80 md:opacity-100 -top-36 md:top-[-1100px] right-[-400px] md:-right-96 w-[1500px] h-[900px] z-0 md:w-[1500px] md:h-[1800px]" />
    </div>
  )
}

export default TopBanner
