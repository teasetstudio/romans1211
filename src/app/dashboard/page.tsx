import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { IconText, IconMusic, IconGame, IconLibrary, IconClock, IconArrowLeft, IconPlus } from "@/res/icons";
import { ROUTE_DASHBOARD_LIBRARY, ROUTE_DASHBOARD_MATERIAL_CREATE } from "@/res/routes";
import { getDashboardMaterialUrl } from "@/utils/urls";
import { TMaterialWithType } from "@/types/Materials";
import { materialService } from "@/lib/MaterialServiceForSSR";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.user?.id) return null;

  // Get default organization
  const defaultOrg = await prisma.organization.findFirst({
    where: { userId: session.user.id, isDefault: true },
  });

  if (!defaultOrg) return null;

  const songsCount = await prisma.song.count({ where: { organizationId: defaultOrg.id }});
  const gamesCount = await prisma.game.count({ where: { organizationId: defaultOrg.id }});
  const textsCount = await prisma.text.count({ where: { organizationId: defaultOrg.id }});

  // Get the most recent materials
  const recentMaterials: TMaterialWithType[] = await materialService.findLatestMaterials(defaultOrg.id, 3);

  const totalMaterials = songsCount + gamesCount + textsCount;

  const materials = [
    {
      type: 'game',
      label: 'Games',
      count: gamesCount,
      icon: IconGame,
      color: 'from-purple-500 to-purple-600',
    },
    {
      type: 'text',
      label: 'Texts',
      count: textsCount,
      icon: IconText,
      color: 'from-blue-500 to-blue-600',
    },
    {
      type: 'song',
      label: 'Songs',
      count: songsCount,
      icon: IconMusic,
      color: 'from-green-500 to-green-600',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-dark">Dashboard</h1>
            <div className="flex items-center gap-4">
              <Link
                href={ROUTE_DASHBOARD_MATERIAL_CREATE}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-secondary text-white rounded-[12px] transition-colors shadow-md hover:shadow-lg"
              >
                <IconPlus className="w-5 h-5 text-white" />
                Create New Material
              </Link>
              <div className="bg-dark text-white px-4 py-2 rounded-[12px] shadow-md">
                <span className="font-semibold">Total: {totalMaterials}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Material Stats */}
          <div className="lg:col-span-9">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {materials.map((material) => (
                <div
                  key={material.type}
                  className="bg-white rounded-[24px] p-6 relative overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] transition-shadow"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${material.color} p-2.5 flex items-center justify-center shadow-md`}>
                        <material.icon className="w-6 h-6 text-white" />
                      </div>
                      <span className={`text-2xl font-bold bg-gradient-to-r ${material.color} bg-clip-text text-transparent`}>
                        {material.count}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-dark mb-4">{material.label}</h3>
                    {material.count > 0 ? (
                      <div className="flex items-center justify-between">
                        <Link
                          href={`${ROUTE_DASHBOARD_LIBRARY}?type=${material.type}`}
                          className="text-sm text-gray2 hover:text-primary transition-colors hover:underline"
                        >
                          View All →
                        </Link>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm text-gray2 mb-4">
                          No {material.type} created yet
                        </p>
                        <Link
                          href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=${material.type}`}
                          className="inline-flex items-center px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-dark rounded-[12px] transition-colors shadow-sm"
                        >
                          Create One
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Materials */}
            <div className="bg-white rounded-[24px] overflow-hidden border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <h2 className="text-xl font-semibold text-dark">Recent Materials</h2>
              </div>
              <div className="p-6">
                <div className="divide-y divide-gray-200">
                  {recentMaterials.length > 0 ? recentMaterials.map((material, index: number) => (
                    <Link 
                      key={`${material.title}-${index}`}
                      href={getDashboardMaterialUrl({ type: material.type, id: material.id })}
                      className="flex items-center justify-between py-3 first:pt-0 last:pb-0 hover:bg-gray-50 rounded-lg px-3 -mx-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                          {material.type === 'game' && <IconGame className="w-5 h-5 text-purple-500" />}
                          {material.type === 'text' && <IconText className="w-5 h-5 text-blue-500" />}
                          {material.type === 'song' && <IconMusic className="w-5 h-5 text-green-500" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-dark">{material.title}</h3>
                          <p className="text-sm text-gray2">
                            Created {new Date(material.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <IconArrowLeft className="w-5 h-5 rotate-180 text-gray2" />
                    </Link>
                  )) : (
                    <div className="text-sm text-gray2">No recent materials. Create one.</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-2 mb-6">
                <IconClock className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold text-dark">Quick Actions</h2>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=game`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-[12px] transition-all group border border-gray-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <IconGame className="w-5 h-5 text-purple-500" />
                      <span className="font-medium">Create Game</span>
                    </div>
                    <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link
                    href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=text`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-[12px] transition-all group border border-gray-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <IconText className="w-5 h-5 text-blue-500" />
                      <span className="font-medium">Create Text</span>
                    </div>
                    <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
                  </Link>
                  <Link
                    href={`${ROUTE_DASHBOARD_MATERIAL_CREATE}?type=song`}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-[12px] transition-all group border border-gray-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <IconMusic className="w-5 h-5 text-green-500" />
                      <span className="font-medium">Create Song</span>
                    </div>
                    <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
                  </Link>
                </div>

                <div className="h-px bg-gray-200" />

                <Link
                  href={ROUTE_DASHBOARD_LIBRARY}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 text-dark rounded-[12px] transition-all group border border-gray-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-2">
                    <IconLibrary className="w-5 h-5 text-primary" />
                    <span className="font-medium">Browse Library</span>
                  </div>
                  <IconArrowLeft className="w-4 h-4 rotate-180 text-gray2 group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
