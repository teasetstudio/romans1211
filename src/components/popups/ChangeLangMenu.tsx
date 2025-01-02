"use client"

import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'
import { useRouter } from 'next/navigation'

import { useLocale, useTranslations } from 'next-intl';
import React, { useRef } from 'react'
import TextButton from '@/components/buttons/TextButton'
import H9 from '@/components/typo/H9'
import { IconDown } from '@/res/icons'
import { NAMESPACE_COMMON } from '@/res/namespaces'
import { Lang } from '@/types/Lang'

const ChangeLangMenu = () => {
  const t = useTranslations(NAMESPACE_COMMON)
  const menuRef = useRef<HTMLButtonElement>(null)

  const locale = useLocale()

  const onChangeLanguage = () => {
    // Close dropdown on language change
    if (menuRef.current) menuRef.current.click()
  }

  return (
    <div>
      <Popover as='div' className="hidden md:flex max-h-5 cursor-pointer">
        {({ open }) => (
          <>
            <PopoverButton className="flex items-center outline-none" ref={menuRef}>
              <H9 color="text-white" weight="semibold" className="mr-1 w-4">
                {t('lang')}
              </H9>
              <div className="flex mt-0.5">
                <IconDown
                  alt="arrow down"
                  className={`transition-transform transform ${open ? 'rotate-180' : 'rotate-0'
                    }`}
                />
              </div>
            </PopoverButton>
            <PopoverBackdrop className="fixed inset-0" />
            <PopoverPanel className="absolute z-50 right-0 top-16 bg-white w-36 rounded-xl p-6 border border-gray3 space-y-4">
              <LangBtns
                title="English"
                active={locale === Lang.en}
                onClose={onChangeLanguage}
                locale={Lang.en}
              />
              <LangBtns
                title="Russian"
                active={locale === Lang.ru}
                onClose={onChangeLanguage}
                locale={Lang.ru}
              />
            </PopoverPanel>
          </>
        )}
      </Popover>
    </div>
  )
}

export default ChangeLangMenu

interface IBtnProps {
  title: string
  active?: boolean
  locale: Lang
  onClose: () => void
}

const LangBtns = ({ title, active = false, locale, onClose }: IBtnProps) => {
  const router = useRouter();

  const onClick = () => {
    onClose()
    document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=31536000; SameSite=Lax`
    router.refresh()
  };

  return (
    <span className="flex">
      <TextButton
        onClick={onClick}  // Close dropdown on language change
        className={`${active && 'underline'} w-full hover:underline`}
      >
        <H9 color="text-secondary" weight="semibold" className="text-center">
          {title}
        </H9>
      </TextButton>
    </span>
  )
}
