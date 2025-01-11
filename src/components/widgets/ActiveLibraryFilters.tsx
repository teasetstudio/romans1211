"use client"

import { usePathname } from '@/i18n/routing';
import { appendParamsToUrl } from '@/utils/urls'
import { Link } from '@/i18n/routing';
import React from 'react'

interface IProps {
  className?: string
  type?: string
  page: string
  searchTerm?: string
  tags: string[]
}

const ActiveLibraryFilters = ({ className, page, searchTerm, tags, type }: IProps) => {
  const pathname = usePathname()

  const buildUrl = (params: { [key: string]: string | null }) => {
    return appendParamsToUrl({url: pathname, params});
  };

  return (
    <>
      {(searchTerm || tags.length > 0 || type) && (
        <div className={className}>
          <div className="container">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-gray-600">Active filters:</span>
              {type && (
                <Link
                  id='active-type-link'
                  href={buildUrl({
                    type: null,
                    'search-term': searchTerm || null,
                    tags: tags.join(',') || null,
                    page,
                  })}
                  className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm flex items-center gap-1 hover:bg-purple-200"
                >
                  Type: {Array.isArray(type) ? type.join(',') : type}
                  <span className="text-xs">×</span>
                </Link>
              )}
              {searchTerm && (
                <Link
                  href={buildUrl({
                    type: type || null,
                    'search-term': null,
                    tags: tags.join(',') || null,
                    page,
                  })}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
                >
                  Search: {searchTerm}
                  <span className="text-xs">×</span>
                </Link>
              )}
              {tags.map((tag) => (
                <Link
                  key={tag}
                  href={buildUrl({
                    type: type as string || null,
                    'search-term': searchTerm || null,
                    tags: tags.filter(t => t !== tag).join(',') || null,
                    page,
                  })}
                  className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1 hover:bg-green-200"
                >
                  Tag: {tag}
                  <span className="text-xs">×</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ActiveLibraryFilters
