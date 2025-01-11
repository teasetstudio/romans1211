import { Link } from '@/i18n/routing';
import React from 'react'
import { useTranslations } from 'next-intl';
import FooterCTABanner from '@/components/banners/FooterCTABanner'
import H7 from '@/components/typo/H7'
import H9 from '@/components/typo/H9'

import { NAMESPACE_COMMON } from '@/res/namespaces'
import { footerLinks } from '@/res/routes'
import { COMPANY_ADDRESS, COMPANY_EMAIL } from '@/res/values'
import { IconAnchor, IconCross, IconLove } from '@/res/icons';

const Footer = () => {
  const t = useTranslations(NAMESPACE_COMMON);

  return (
    <div className="mt-16 md:mt-32">
      <FooterCTABanner />
      <div className="container">
        <div className="mt-14 flex justify-between gap-10 flex-col lg:flex-row">
          <div className="flex justify-between flex-wrap gap-10 xl:gap-32">
            {footerLinks.map((item) => {
              return (
                <div className="flex flex-col" key={item.title}>
                  <H9 weight="semibold" className="mb-6">
                    {t(item.title)}
                  </H9>
                  <ul className="grid-cols-2 grid gap-x-8 xl:gap-x-14 gap-y-3">
                    {item.items.map(({ link, title }) => (
                      <li key={link}>
                        <Link href={link}>
                          <H7 weight="medium" color="text-gray1">
                            {t(title)}
                          </H7>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col lg:items-end items-start">
            <H9 weight="semibold" className="mb-[23px]">
              <Link href="/" className="text-white text-2xl font-black tracking-wider hover:text-gray2 transition-colors">
                <span className="hidden md:inline">Ephesians </span>4:12
              </Link>
            </H9>
            <H7 color="text-gray1" className="mb-[10px]">
              {COMPANY_ADDRESS}
            </H7>
            <a
              href={`mailto:${COMPANY_EMAIL}`}
              className="text-base text-gray1"
            >
              <H7 color="text-gray1">{COMPANY_EMAIL}</H7>
            </a>
          </div>
        </div>
        <div className="mt-16 flex flex-col mb-12 lg:mb-36">
          <H9 className="mb-6" weight="semibold">
            {t('footer.1_cor_13_13')}
          </H9>

          <div className="flex flex-wrap w-auto sm:mx-0 gap-x-10 gap-y-10 items-center text-slate-500">
            <IconCross alt="Faith" />
            <IconAnchor alt="Hope" />
            <IconLove alt="Love" />
          </div>
        </div>
      </div>
      <div className="bg-gray5 py-4">
        <div className="container">
          <H9 color="text-gray1">
            <> 2021 oneLib. {t('footer.rights')}</>
          </H9>
        </div>
      </div>
    </div>
  )
}

export default Footer
