import { useTranslations } from 'next-intl';
import AdButton from '@/components/buttons/AdButton'
import H2 from '@/components/typo/H2'
import H3 from '@/components/typo/H3'
import H7 from '@/components/typo/H7'
import H8 from '@/components/typo/H8'
import Gradient from '@/components/ui/Gradient'
import { IconNewspaper } from '@/res/icons'
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
        <div className="container py-14 sm:py-18 lg:py-24">
          <div className="flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12">
            <div className="max-w-md md:max-w-none w-full md:w-7/12 lg:w-5/12 mx-auto md:mx-0 text-center md:text-left">
              <H2 color="text-white" className="mb-7">
                {t('top_banner.title')}
              </H2>

              <H7 color="text-gray2" className="mb-3">
                {t('top_banner.subtitle')}
              </H7>
              <H7 color="text-gray2" className="mb-12">
                {t('top_banner.subtitle2')}
              </H7>

              <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-7 md:justify-start">
                <ClientTopBannerBtn />

                <AdButton
                  bgColor="bg-transparent"
                  color="text-white"
                  icon={IconNewspaper}
                  href={ROUTE_LIBRARY}
                  iconColor="gray4"
                  title={t('top_banner.view_placements')}
                  className="border border-white hover:bg-gray1"
                />
              </div>
            </div>

            <div className="w-full md:w-5/12 lg:w-7/12 flex justify-center md:justify-end">
              <div className="max-w-md w-full bg-gradient-to-br from-primary/20 to-primary/10 backdrop-blur-sm rounded-2xl p-8 shadow-[-13px_20px_18px_rgb(0,0,0,0.85)] border border-white/10">
                <H3 color="text-white" className="text-center leading-relaxed">
                  {t('top_banner.ephesians_4_12')}
                </H3>
                <div className="text-right mt-4">
                  <H8 color="text-gray3" className="italic">{t('top_banner.ref_ephesians_4_12')}</H8>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Gradient className="opacity-80 md:opacity-100 -top-36 md:top-[-1100px] right-[-400px] md:-right-96 w-[1500px] h-[900px] z-0 md:w-[1500px] md:h-[1800px]" />
    </div>
  )
}

export default TopBanner
