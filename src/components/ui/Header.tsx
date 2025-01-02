import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl';
import { Logo } from '@/res/images'

import { NAMESPACE_COMMON } from '@/res/namespaces';
import { ROUTE_LIBRARY } from '@/res/routes';
import H9 from '../typo/H9';
import UserDropdown from '../popups/UserDropdown';
import ChangeLangMenu from '../popups/ChangeLangMenu';

// Add ssr: false if "use client". Why? because the resource being preloaded but not used within a few seconds,
// ssr: false avoids inefficiency in how UserDropdown is being dynamically imported and preloaded.
// const MobileMenu = dynamic(() => import('@/components/popups/MobileMenu'), { ssr: false })
// const ChangeLangMenu = dynamic(() => import('@/components/popups/ChangeLangMenu'))
// const UserDropdown = dynamic(() => import('@/components/popups/UserDropdown'), { ssr: false })

async function Header() {
  return (
    <>
      <div className="bg-dark sticky z-40 top-0 left-0">
        <div className="container">
          <div className="flex justify-between py-3 items-center relative">
            <Link href="/">
              <Image src={Logo} alt="logo" height={39} priority />
            </Link>

            <div className="flex items-center">
              <LibraryCatalogLink />

              <div className="flex rounded-lg bg-primary px-3 md:px-10 py-3.5 items-center">
                {/* AD MANAGER */}

                <MenuDivider />

                <div className="flex items-center space-x-3 md:space-x-6">
                  <UserDropdown className="max-h-5" />
                  {/* Shop Card Component was here  */}
                  <ChangeLangMenu />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header

const LibraryCatalogLink = () => {
  const t = useTranslations(NAMESPACE_COMMON)
  return (
    <Link href={ROUTE_LIBRARY}>
      <span className="hidden md:block mr-5 lg:mr-10">
        <H9 color="text-white">{t('header.btn_library_catalog')}</H9>
      </span>
    </Link>
  )
}

const MenuDivider = () => (<div className="hidden md:block h-5 w-px bg-white mx-5 lg:mx-10" />)
