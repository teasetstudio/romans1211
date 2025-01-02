import { ROUTE_LIBRARY } from '@/res/routes';
import Link from 'next/link';
import React from 'react';
import { AsyncParams, ILibraryCatalogSearchParams } from '@/types/Params';
import LibraryCatalogFilter from './LibraryCatalogFilter';
import { materialService } from '@/lib/MaterialServiceForSSR';

type IProps = AsyncParams<{}, ILibraryCatalogSearchParams>

export default async function LibraryCatalogPage({ searchParams }: IProps) {
  const searchParamsRes = await searchParams;
  const { type = '', page = '1', 'search-term': searchTerm, tags } = searchParamsRes;
  const limit = 20;
  const parsedPage = parseInt(page);
  const tagsArray = tags ? tags.split(',') : [];
  
  const { materials, totalPages } = await materialService.findInCatalog({
    type,
    page: parsedPage,
    limit: limit,
    searchTerm,
    tags: tagsArray,
  })

  // Helper function to build URL with current filters
  const buildUrl = (params: { [key: string]: string | null }) => {
    const urlParams = new URLSearchParams();
    if (params.type) urlParams.set('type', params.type);
    if (params['search-term']) urlParams.set('search-term', params['search-term']);
    if (params.page) urlParams.set('page', params.page);
    if (params.tags) urlParams.set('tags', params.tags);
    return `/library-catalog?${urlParams.toString()}`;
  };

  return (
    <div className="container mx-auto p-4">
      {/* Filters */}
      <div className="mb-8 space-y-4">
        {/* Library Catalog filters */}
        <LibraryCatalogFilter searchParams={searchParamsRes} />

        {/* Active Filters */}
        {(searchTerm || tagsArray.length > 0 || type) && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-gray-600">Active filters:</span>
            {type && (
              <Link
                id='active-type-link'
                href={buildUrl({
                  type: null,
                  'search-term': searchTerm || null,
                  tags: tags || null,
                  page
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
                  type: type as string || null,
                  'search-term': null,
                  tags: tags || null,
                  page
                })}
                className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1 hover:bg-blue-200"
              >
                Search: {searchTerm}
                <span className="text-xs">×</span>
              </Link>
            )}
            {tagsArray.map((tag) => (
              <Link
                key={tag}
                href={buildUrl({
                  type: type as string || null,
                  'search-term': searchTerm || null,
                  tags: tagsArray.filter(t => t !== tag).join(',') || null,
                  page
                })}
                className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-1 hover:bg-green-200"
              >
                Tag: {tag}
                <span className="text-xs">×</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {materials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {materials.map((material) => (
            <div
              key={material.id}
              className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
            >
              <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500 capitalize">{material.type}</span>
                <Link
                  href={`${ROUTE_LIBRARY}/${material.type}/${material.id}`}
                  className="text-blue-500 hover:underline"
                >
                  View Details
                </Link>
              </div>
              {material.tags && material.tags.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-500">Tags:</span>
                  <ul className="list-none m-0 p-0 flex flex-wrap gap-2">
                    {material.tags.map((tag: any) => (
                      <li key={tag.id} className="text-sm text-gray-600">{tag.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-xl text-gray-600 mb-2">No materials found</p>
          <p className="text-gray-500">
            {searchTerm
              ? `No results found for "${searchTerm}". Try a different search term.`
              : type
                ? `No ${type} materials available yet.`
                : 'No materials available yet.'
            }
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {parsedPage > 1 && (
            <Link
              href={buildUrl({
                type: type as string || null,
                'search-term': searchTerm || null,
                page: (parsedPage - 1).toString()
              })}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Previous
            </Link>
          )}

          <span className="px-4 py-2">
            Page {parsedPage} of {totalPages}
          </span>

          {parsedPage < totalPages && (
            <Link
              href={buildUrl({
                type: type as string || null,
                'search-term': searchTerm || null,
                page: (parsedPage + 1).toString()
              })}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
