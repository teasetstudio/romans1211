"use client"

import { Popover, PopoverBackdrop, PopoverButton, PopoverPanel } from '@headlessui/react'
import React, { useRef, useState } from 'react'
import { useTranslations } from 'next-intl';
import { useSession, signOut } from 'next-auth/react'

import TextButton from '@/components/buttons/TextButton'
import H9 from '@/components/typo/H9'
import useScreenSize from '@/hooks/useScreenSize'
import { IconUser } from '@/res/icons'
import { NAMESPACE_COMMON } from '@/res/namespaces'
import { ROUTE_DASHBOARD, ROUTE_SETTINGS } from '@/res/routes'
import Spinner from '../widgets/ui/Spinner';
import AuthPopup from './AuthPopup';

// const AuthPopup = dynamic(() => import('@/components/popups/AuthPopup'), { ssr: false })

interface IProps {
  onClick?: () => void
  className?: string
}

const UserDropdown = ({ onClick, className = '' }: IProps) => {
  const width = useScreenSize().width
  const t = useTranslations(NAMESPACE_COMMON)
  const { data: session } = useSession()

  const menuRef = useRef<HTMLButtonElement>(null)
  const [userLoading, setUserLoading] = useState(false)
  const [authPopup, setAuthPopup] = useState(false)

  const closeAuthPopup = () => setAuthPopup(false)

  const openAuthPopup = () => {
    if (!session?.user) {
      setAuthPopup(true)
    }
  }

  const userName = session?.user?.name
  const responsiveName = userName
    ? width && width < 576 && userName.length > 7
      ? `${userName.slice(0, 7)}..`
      : userName.length > 10 && width && width < 1024
        ? `${userName.slice(0, 10)}..`
        : userName.length > 25
          ? `${userName.slice(0, 25)}..`
          : userName
    : null

  const onSignOut = async (close: () => void) => {
    setUserLoading(true)
    await signOut({ redirect: false })
    setAuthPopup(false)
    close()
    setUserLoading(false)
  }
  return (
    <div className={className}>
      <Popover>
        <div className="relative">
          {userLoading ?
            <Spinner sizeClass='w-4 h-4' color='border-gray-100' /> :
            <PopoverButton
              className="flex items-center outline-none"
              onMouseDown={() => {
                openAuthPopup()
                if (onClick) {
                  onClick()
                }
              }}
              ref={menuRef}
            >
              <IconUser alt="user" />
              {responsiveName && (
                <H9 color="text-white" weight="semibold" className="ml-2">
                  {responsiveName}
                </H9>
              )}
            </PopoverButton>
          }

          <PopoverBackdrop className="fixed inset-0" />

          {session?.user && (
            <PopoverPanel className="absolute z-50 right-0 md:right-1/2 transform md:translate-x-1/2 top-10 bg-white w-48 rounded-xl p-6 border border-gray3 flex flex-col items-center space-y-6 outline-none">
              {({ close }) => (
                <>
                  <UserBtns title={t('dashboard')} href={ROUTE_DASHBOARD} onClick={close} />
                  <UserBtns title={t('auth.settings')} href={ROUTE_SETTINGS} onClick={close} />
                  <UserBtns title={t('auth.logout')} onClick={() => { onSignOut(close) }} />
                </>
              )}
            </PopoverPanel>
          )}
        </div>
      </Popover>

      {!session?.user && <AuthPopup isOpen={authPopup} onClose={closeAuthPopup} />}
    </div>
  )
}

export default UserDropdown

interface ITextBasicProps {
  title: string
}

interface IBtnText extends ITextBasicProps {
  onClick: () => void
  href?: never
}

interface ILinkText extends ITextBasicProps {
  onClick?: () => void
  href: string
}

type TTextProps = IBtnText | ILinkText

const UserBtns = ({ title, ...props }: TTextProps) => {
  return <TextButton {...props}>{title}</TextButton>
}
