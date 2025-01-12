'use client'

import { ILibraryCatalogSearchParams } from '@/types/Params'
import { IconSearch } from '@/res/icons'
import { useRouter, usePathname } from '@/i18n/routing'
import { FormEvent, useState, useEffect } from 'react'
import { NAMESPACE_DASHBOARD } from '@/res/namespaces'
import { useTranslations } from 'next-intl'

interface IProps {
  searchParams: ILibraryCatalogSearchParams
  className?: string
}

const DashboardLibraryFilter = ({ searchParams, className }: IProps) => {
  const t = useTranslations(NAMESPACE_DASHBOARD);

  const { type, 'search-term': searchTerm, tags } = searchParams
  const router = useRouter()
  const pathname = usePathname()

  // State for form inputs
  const [search, setSearch] = useState(searchTerm || '')
  const [materialType, setMaterialType] = useState(type || '')
  const [tagInput, setTagInput] = useState(tags || '')

  // Update state when props change
  useEffect(() => {
    setSearch(searchTerm || '')
    setMaterialType(type || '')
    setTagInput(tags || '')
  }, [searchTerm, type, tags])

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const params = new URLSearchParams()

    // Add non-empty values to params
    if (search) params.append('search-term', search)
    if (materialType) params.append('type', materialType)
    if (tagInput) params.append('tags', tagInput)

    // Reset to page 1 when filter changes
    params.set('page', '1')

    // Navigate with new params
    router.push(`${pathname}${params.toString() ? `?${params.toString()}` : ''}`)
  }

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-4">
          {/* Search Input */}
          <div className="flex-1 min-w-[240px]">
            <div className="relative">
              <input
                type="text"
                name="search-term"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`${t('search_materials')}...`}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
            </div>
          </div>

          {/* Material Type Select */}
          <div className="w-full sm:w-auto">
            <select
              name="type"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value)}
              className="w-full sm:w-[180px] px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors appearance-none cursor-pointer"
            >
              <option value="">{t('all_materials')}</option>
              <option value="text">{t('texts')}</option>
              <option value="song">{t('songs')}</option>
              <option value="game">{t('games')}</option>
            </select>
          </div>

          {/* Tags Input */}
          <div className="w-full sm:w-auto">
            <input
              type="text"
              name="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder={t('tags_placeholder')}
              className="w-full sm:w-[200px] px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('search')}
          </button>
        </div>
      </form>
    </div>
  )
}

export default DashboardLibraryFilter
