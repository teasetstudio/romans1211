import { ROUTE_LIBRARY } from '@/res/routes';
import React from 'react';
import { AsyncParams, ILibraryCatalogSearchParams } from '@/types/Params';
import { materialService } from '@/lib/MaterialServiceForSSR';
import { _transformMaterialToCard } from '@/utils/transformers';
import CardWidget from '@/components/widgets/CardWidget';
import { appendParamsToUrl } from '@/utils/urls';
import LibraryCatalogFilter from '@/components/forms/LibraryCatalogFilter';
import ActiveLibraryFilters from '@/components/widgets/ActiveLibraryFilters';
import Pagination from '@/components/widgets/Pagination';

type IProps = AsyncParams<{}, ILibraryCatalogSearchParams>

export default async function LibraryCatalogPage({ searchParams }: IProps) {
  const searchParamsRes = await searchParams;
  const { type = '', page = '1', limit = '20', 'search-term': searchTerm, tags } = searchParamsRes;
  const parsedLimit = parseInt(limit);
  const parsedPage = parseInt(page);
  const tagsArray = tags ? tags.split(',') : [];
  
  const { materials, totalPages } = await materialService.findInCatalog({
    type,
    page: parsedPage,
    limit: parsedLimit,
    searchTerm,
    tags: tagsArray,
  })

  const cards = materials.map(material => _transformMaterialToCard(material, material.type));

  // Helper function to build URL with current filters
  const buildUrl = (_page: number) => {
    const _params = {
      type: type as string || null,
      'search-term': searchTerm || null,
      page: _page.toString()
    }
    return appendParamsToUrl({url: ROUTE_LIBRARY, params: _params});
  };

  return (
    <div className="mx-auto">
      {/* Filters */}
      <div>
        <LibraryCatalogFilter searchParams={searchParamsRes} className="my-6" />

        <ActiveLibraryFilters
          page={page}
          searchTerm={searchTerm}
          tags={tagsArray}
          type={type}
        />
      </div>

      {/* Results Grid */}
      <CardWidget cards={cards} />

      {/* Pagination */}
      <Pagination
        totalPages={totalPages}
        currentPage={parsedPage}
        buildUrl={buildUrl}
      />
    </div>
  );
}
