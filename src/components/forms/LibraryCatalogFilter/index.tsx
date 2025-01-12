import H2 from '@/components/typo/H2'
import H8 from '@/components/typo/H8'
import H9 from '@/components/typo/H9'
import { useTranslations } from 'next-intl'
import { NAMESPACE_WIDGETS } from '@/res/namespaces'
import { SubmitFormListener } from './SubmitFormListener'
import { ILibraryCatalogSearchParams } from '@/types/Params'
import { IconSearch } from '@/res/icons'

interface IProps {
  searchParams: ILibraryCatalogSearchParams
  className?: string
}

const LibraryCatalogFilter = ({ searchParams, className }: IProps) => {
  const t = useTranslations(NAMESPACE_WIDGETS)
  const { type, 'search-term': searchTerm, tags } = searchParams
  return (
    <div className={className}>
      <div className="container">
        <SubmitFormListener />
        <div className="bg-gradient-to-br from-gray5 to-gray5/95 border border-gray3 rounded-3xl backdrop-blur-sm shadow-lg">
          <div className="sm:px-8 sm:py-6 p-6">
            <div className="flex flex-col mb-6">
              <H2 color="text-secondary" className="mb-2">{t('catalog_filter.title')}</H2>
              <H8 weight="medium" color="text-gray1">{t('catalog_filter.subtitle')}</H8>
            </div>

            <form id="library-catalog-form" className="flex flex-col gap-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="lg:w-1/4 relative">
                  <label className="block mb-2">
                    <H9 color="text-gray2" className="font-medium">{t('catalog_filter.material_type')}</H9>
                  </label>
                  <select
                    name="type"
                    defaultValue={type}
                    className="w-full px-4 py-3 bg-white/10 border border-gray3 rounded-xl text-gray1 placeholder-gray2 focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer [&>option]:bg-gray5 [&>option]:text-gray1 [&>option]:py-3 [&>option]:px-4 [&>option]:cursor-pointer [&>option]:border-0"
                  >
                    <option value="" className="border-b border-gray3">{t('catalog_filter.all_materials')}</option>
                    <option value="text" className="border-b border-gray3">{t('catalog_filter.texts')}</option>
                    <option value="song" className="border-b border-gray3">{t('catalog_filter.songs')}</option>
                    <option value="game">{t('catalog_filter.games')}</option>
                  </select>
                  <div className="absolute right-4 top-[45px] -translate-y-1/2 pointer-events-none">
                    <svg width="12" height="8" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 1L5 5L9 1" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>

                <div className="lg:w-2/4">
                  <label className="block mb-2">
                    <H9 color="text-gray2" className="font-medium">{t('catalog_filter.search')}</H9>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="search-term"
                      defaultValue={searchTerm}
                      placeholder={t('catalog_filter.search_materials')}
                      className="w-full pl-11 pr-4 py-3 bg-white/10 border border-gray3 rounded-xl text-gray1 placeholder-gray2 focus:outline-none focus:border-primary transition-colors"
                    />
                    <IconSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray2" />
                  </div>
                </div>

                <div className="lg:w-2/4">
                  <label className="block mb-2">
                    <H9 color="text-gray2" className="font-medium">{t('catalog_filter.tags')}</H9>
                  </label>
                  <input
                    type="text"
                    name="tags"
                    defaultValue={tags}
                    placeholder={t('catalog_filter.tags_placeholder')}
                    className="w-full px-4 py-3 bg-white/10 border border-gray3 rounded-xl text-gray1 placeholder-gray2 focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20"
                >
                  {t('catalog_filter.apply_filters')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LibraryCatalogFilter
