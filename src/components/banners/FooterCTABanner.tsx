import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';

import Button from '@/components/buttons/Button'
import H6 from '@/components/typo/H6'
import H9 from '@/components/typo/H9'
import Gradient from '@/components/ui/Gradient'
import { NAMESPACE_COMMON } from '@/res/namespaces'
import { ROUTE_LIBRARY } from '@/res/routes'

import BannerWrapper from './BannerWrapper'
import ClientFooterBtn from './client-components/ClienFooterBtn'

const FooterCTABanner = () => {
  const t = useTranslations(NAMESPACE_COMMON)
  return (
    <BannerWrapper className="relative overflow-hidden">
      <div className="flex items-center sm:justify-between lg:flex-row flex-col justify-center flex-wrap py-7 lg:py-9 relative z-10 gap-4">
        <Link href="/" className="text-white text-3xl font-black tracking-wider hover:text-gray2 transition-colors">
          <span className="hidden sm:inline">Ephesians </span>4:12
        </Link>
        <div className="flex items-center flex-wrap sm:gap-10 gap-5 justify-center">
          <H6
            color="text-gray4"
            className="text-lg lg:text-right text-center max-w-xs"
          >
            {t('footer.banner.title')}
          </H6>
          <div className="flex gap-2 lg:gap-3 flex-wrap justify-center">
            <ClientFooterBtn title={t('footer.banner.create')} />
            <Button
              href={ROUTE_LIBRARY}
              className="w-44"
              bgColor="bg-gray4"
            >
              <H9 weight="semibold" className="text-center">
                {t('footer.banner.btn_view_placements')}
              </H9>
            </Button>
          </div>
        </div>
      </div>

      <Gradient className="top-[-1350px] right-[-450px] z-0 w-[1700px] h-[2000px]" />
    </BannerWrapper>
  )
}

export default FooterCTABanner
