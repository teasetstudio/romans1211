import H2 from '@/components/typo/H2'
import H8 from '@/components/typo/H8'
import { useTranslations } from 'next-intl'
import { NAMESPACE_CATALOG_PAGE } from '@/res/namespaces'
import React from 'react'
import { SubmitFormListener } from './SubmitFormListener'
import { ILibraryCatalogSearchParams } from '@/types/Params'

interface IProps {
  searchParams: ILibraryCatalogSearchParams
}

const LibraryCatalogFilter = ({ searchParams }: IProps) => {
  const t = useTranslations(NAMESPACE_CATALOG_PAGE)
  const { type, 'search-term': searchTerm, tags } = searchParams
  return (
    <div className="container">
      <SubmitFormListener />
      <div className="sm:px-8 sm:py-4 p-8 bg-gray5 border border-gray3 rounded-3xl my-12">
        <div className="flex flex-col mb-4">
          <H2 color="text-secondary" className="mb-3">{t('title')}</H2>
          <H8 weight="medium" color="text-gray1">{t('subtitle')}</H8>
        </div>

        <form id="library-catalog-form" className="mb-4 flex flex-col gap-4">
          <div className="flex-1 space-y-2">
            <select
              name="type"
              defaultValue={type}
              className="w-full p-2 border rounded-lg"
            >
              <option value="">All Materials</option>
              <option value="text">Texts</option>
              <option value="song">Songs</option>
              <option value="game">Games</option>
            </select>
            <input
              type="text"
              name="search-term"
              defaultValue={searchTerm}
              placeholder="Search materials..."
              className="w-full p-2 border rounded-lg"
            />
            <input
              type="text"
              name="tags"
              defaultValue={tags}
              placeholder="Filter by tags (comma-separated)"
              className="w-full p-2 border rounded-lg"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Apply Filters
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LibraryCatalogFilter