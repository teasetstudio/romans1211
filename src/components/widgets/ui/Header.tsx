import { ProgressLink as Link } from '@/components/buttons/ProgressLink';
import { useTranslations } from 'next-intl';

import { NAMESPACE_COMMON } from '@/res/namespaces';
import { ROUTE_LIBRARY } from '@/res/routes';
import H9 from '../../typo/H9';
import UserDropdown from '../../popups/UserDropdown';
import ChangeLangMenu from '../../popups/ChangeLangMenu';
import CreateMaterialButton from '../../buttons/CreateMaterialButton';

function Header() {
  const t = useTranslations(NAMESPACE_COMMON)
  return (
    <>
      <div className="bg-dark sticky z-[100] top-0 left-0 shadow-lg">
        <div className="container">
          <div className="flex justify-between py-2.5 items-center relative">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-white text-2xl font-black tracking-wider hover:text-gray2 transition-colors">
                <span className="hidden sm:inline">Ephesians </span>4:12
              </Link>

              <Link href={ROUTE_LIBRARY} className="hidden md:block">
                <H9 color="text-white" className="hover:text-gray2 transition-colors">
                  {t('header.btn_library_catalog')}
                </H9>
              </Link>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
              <CreateMaterialButton />

              <div className="h-5 w-px bg-gray3" />

              <div className="flex items-center gap-3">
                <UserDropdown className="max-h-5" />
                <ChangeLangMenu />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Header
