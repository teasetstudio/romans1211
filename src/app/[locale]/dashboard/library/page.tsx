import { ROUTE_DASHBOARD_LIBRARY } from "@/res/routes";
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { materialService } from "@/lib/MaterialServiceForSSR";
import { ILibrarySearchParams } from '@/types/Params';
import { _transformMaterialToCard } from "@/utils/transformers";
import DashboardLibraryFilter from '@/components/forms/DashboardLibraryFilter';
import ActiveLibraryFilters from '@/components/widgets/ActiveLibraryFilters';
import Pagination from '@/components/widgets/Pagination';
import { appendParamsToUrl } from '@/utils/urls';
import LibraryHeader from "./components/LibraryHeader";
import LibraryCardGrid from "./components/LibraryCardGrid";

export default async function Library({ searchParams }: ILibrarySearchParams) {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const searchParamsRes = await searchParams;
  const { type = '', page = '1', 'search-term': searchTerm, tags } = searchParamsRes;
  const limit = 20;
  const parsedPage = parseInt(page);
  const tagsArray = tags ? tags.split(',') : [];

  // Get default organization
  const defaultOrg = await prisma.organization.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  // Cant be, anyway redirect to create org or show a corresponding message
  if (!defaultOrg) return null

  // Find organization's materials
  const { materials, totalCount, totalPages } = await materialService.findInCatalog({
    type,
    searchTerm,
    tags: tagsArray,
    organizationId: defaultOrg.id, 
    page: parsedPage,
    isPublic: null,
    limit
  });

  const cards = materials.map(material => _transformMaterialToCard(material, material.type, true));

  // Helper function to build URL with current filters
  const buildUrl = (_page: number) => {
    const _params = {
      type: type as string || null,
      'search-term': searchTerm || null,
      tags: tagsArray.length > 0 ? tagsArray.join(',') : null,
      page: _page.toString()
    }
    return appendParamsToUrl({ url: ROUTE_DASHBOARD_LIBRARY, params: _params });
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8 mb-24">
      {/* Header */}
      <LibraryHeader totalCount={totalCount} />

      {/* Filters */}
      <div className="container space-y-4">
        <DashboardLibraryFilter searchParams={searchParamsRes} />
        <ActiveLibraryFilters
          page={page}
          searchTerm={searchTerm}
          tags={tagsArray}
          type={type}
        />
      </div>

      {/* Cards Grid */}
      <LibraryCardGrid cards={cards} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <Pagination
            currentPage={parsedPage}
            totalPages={4}
            buildUrl={buildUrl}
          />
        </div>
      )}
    </div>
  );
}
