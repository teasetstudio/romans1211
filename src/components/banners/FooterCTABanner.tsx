import Image from 'next/image'
import Link from 'next/link'
import { useTranslations } from 'next-intl';

import Button from '@/components/buttons/Button'
import H6 from '@/components/typo/H6'
import H9 from '@/components/typo/H9'
import Gradient from '@/components/ui/Gradient'
import { Logo } from '@/res/images'
import { NAMESPACE_COMMON } from '@/res/namespaces'
import { ROUTE_LIBRARY } from '@/res/routes'

import BannerWrapper from './BannerWrapper'
import ClientFooterBtn from './client-components/ClienFooterBtn'

const FooterCTABanner = () => {
  const t = useTranslations(NAMESPACE_COMMON)
  return (
    <BannerWrapper className="relative overflow-hidden">
      <div className="flex items-center sm:justify-between lg:flex-row flex-col justify-center flex-wrap py-12 lg:py-16 relative z-10">
        <Link href="/">
          <span className="lg:mb-0 mb-12 relative w-40 h-14">
            <Image src={Logo} alt="logo" className="object-cover" />
          </span>
        </Link>
        <div className="flex items-center flex-wrap sm:gap-10 gap-5 justify-center">
          <H6
            color="text-gray4"
            className="text-lg lg:text-right text-center max-w-xs"
          >
            {t('footer.banner.title')}
          </H6>
          <div className="flex gap-3 lg:gap-4 flex-wrap justify-center">
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
