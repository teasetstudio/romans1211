import { ROUTE_DASHBOARD_LIBRARY } from "@/res/routes";
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
import { organizationService } from "@/lib/OrganizationServiceForSSR";

export default async function Library({ searchParams }: ILibrarySearchParams) {
  const session = await getSession();
  if (!session?.user?.id) return null;

  const searchParamsRes = await searchParams;
  const { type = '', page = '1', 'search-term': searchTerm, tags, originalOnly = 'true' } = searchParamsRes;
  const limit = 20;
  const parsedPage = parseInt(page);
  const tagsArray = tags ? tags.split(',') : [];

  const organization = await organizationService.getSelectedOrganization(session.user.id);

  // Can't be, anyway redirect to create org or show a corresponding message
  if (!organization) return null

  // Find organization's materials
  const { materials, totalCount, totalPages } = await materialService.findInCatalog({
    type,
    searchTerm,
    tags: tagsArray,
    organizationId: organization.id, 
    page: parsedPage,
    isPublic: null,
    limit,
    originalOnly: originalOnly === 'true',
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
            totalPages={totalPages}
            buildUrl={buildUrl}
          />
        </div>
      )}
    </div>
  );
}
