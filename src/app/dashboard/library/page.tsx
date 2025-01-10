import TextButton from "@/components/buttons/TextButton";
import { ROUTE_DASHBOARD_LIBRARY, ROUTE_DASHBOARD_MATERIAL_CREATE } from "@/res/routes";
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { materialService } from "@/lib/MaterialServiceForSSR";
import { ILibrarySearchParams } from '@/types/Params';
import { _transformMaterialToCard } from "@/utils/transformers";
import CardWidget from "@/components/widgets/CardWidget";
import DashboardLibraryFilter from '@/components/forms/DashboardLibraryFilter';
import ActiveLibraryFilters from '@/components/widgets/ActiveLibraryFilters';
import Pagination from '@/components/widgets/Pagination';
import { appendParamsToUrl } from '@/utils/urls';

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
      <div className="container">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Library</h1>
            <p className="text-sm text-gray-600">Total: {totalCount} items</p>
          </div>
          <TextButton 
            href={ROUTE_DASHBOARD_MATERIAL_CREATE} 
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Create Resource
          </TextButton>
        </div>
      </div>

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
      <div className="min-h-[300px]">
        {cards.length === 0 ? (
          <p className="text-gray-500 container">
            No materials found. Click{` `}
            <TextButton 
              href={ROUTE_DASHBOARD_MATERIAL_CREATE} 
              className="text-primary underline hover:text-gray-900"
            >
              here
            </TextButton>{` `}
            to create your first resource!
          </p>
        ) : (
          <CardWidget cards={cards} />
        )}
      </div>

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
