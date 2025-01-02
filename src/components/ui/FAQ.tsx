"use client"

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { useTranslations } from 'next-intl';
import React from 'react'

import H4 from '@/components/typo/H4'
import H5 from '@/components/typo/H5'
import H7 from '@/components/typo/H7'
import { IconPlus } from '@/res/icons'
import { NAMESPACE_HOME } from '@/res/namespaces'
import TFAQItem from '@/types/FAQItem'

interface Props {
  faqs: TFAQItem[]
  className?: string
}

const FAQItem = ({ question, answer }: TFAQItem) => {
  return (
    <Disclosure>
      {({ open }) => (
        <div>
          <DisclosureButton
            className={`w-full p-8 bg-gray5 rounded-[24px] border border-gray3`}
            aria-expanded={open}
          >
            <div className="flex justify-between items-center">
              <H5
                weight="semibold"
                color="text-secondary"
                className="text-left flex-1"
              >
                {question}
              </H5>

              <IconPlus
                className={`w-7 sm:w-9 transition transform ${open && 'rotate-45'}`}
                alt="x"
              />
            </div>

            <DisclosurePanel className="pt-8 text-left w-full max-w-[800px]">
              <H7 color="text-gray1" weight="medium">
                <span dangerouslySetInnerHTML={{ __html: answer }} />
              </H7>
            </DisclosurePanel>
          </DisclosureButton>
        </div>
      )}
    </Disclosure>
  )
}

const FAQ = ({ faqs, className = '' }: Props) => {
  const t = useTranslations(NAMESPACE_HOME)

  return (
    <div className={className}>
      <div className="container">
        <H4 className="mb-10">{t('faq_title')}</H4>
        <div className="flex flex-col space-y-3">
          {faqs.map((i, id) => (
            <FAQItem key={id} question={t(i.question)} answer={t(i.answer)} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default FAQ
