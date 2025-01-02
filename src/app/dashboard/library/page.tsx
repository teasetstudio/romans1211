import TextButton from "@/components/buttons/TextButton";
import { ROUTE_DASHBOARD_MATERIAL_CREATE } from "@/res/routes";
import Link from "next/link";
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { truncateHtml } from "@/utils/stripAndTruncateHtml";
import { materialService } from "@/lib/MaterialServiceForSSR";
import { ILibrarySearchParams } from '@/types/Params';

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

  const { materials, totalCount, totalPages } = await materialService.findInCatalog({
    type,
    searchTerm,
    tags: tagsArray,
    organizationId: defaultOrg.id, 
    page: parsedPage,
    limit
  });

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start w-full max-w-6xl">
        <div className="flex justify-between items-center w-full">
          <div>
            <h1 className="text-2xl font-bold">Library</h1>
            <p className="text-sm text-gray-600">Total: {totalCount} items</p>
          </div>
          <TextButton href={ROUTE_DASHBOARD_MATERIAL_CREATE} className="underline">Create Resource</TextButton>
        </div>

        {materials.length === 0 ? (
          <p className="text-gray-500">No materials found. Create your first resource!</p>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              {materials.map((material) => (
                <div key={material.id} className="p-6 rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold">{material.title}</h2>
                    <span className="text-xs text-gray-500 capitalize">{material.type}</span>
                  </div>
                  <div
                    className="text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: truncateHtml(material.content || '', 150)
                    }}
                  />
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/dashboard/library/${material.type}/${material.id}`}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="w-full flex justify-center gap-2">
                {parsedPage > 1 && (
                  <Link
                    href={`?page=${parsedPage - 1}`}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm bg-gray-100 border border-gray-300 rounded-md">
                  Page {parsedPage} of {totalPages}
                </span>
                {parsedPage < totalPages && (
                  <Link
                    href={`?page=${parsedPage + 1}`}
                    className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
