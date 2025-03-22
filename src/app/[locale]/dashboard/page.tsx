import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { TMaterialWithType } from "@/types/Materials";
import { materialService } from "@/lib/MaterialServiceForSSR";
import { QuickActions } from "./components/QuickActions";
import { RecentMaterials } from "./components/RecentMaterials";
import DashboardHeader from "./components/DashboardHeader";
import { MaterialStats } from "./components/MaterialStats";
import { organizationService } from "@/lib/OrganizationServiceForSSR";
import { DailyVerse } from "./components/DailyVerse";

export default async function Dashboard() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  
  // Get default organization
  const organization = await organizationService.getSelectedOrganization(session.user.id);
  
  if (!organization) return null;

  const songsCount = await prisma.song.count({ where: { organizationId: organization.id, originalId: null }});
  const gamesCount = await prisma.game.count({ where: { organizationId: organization.id, originalId: null }});
  const textsCount = await prisma.text.count({ where: { organizationId: organization.id, originalId: null }});

  // Get the most recent materials
  const recentMaterials: TMaterialWithType[] = await materialService.findLatestMaterials(organization.id, 3);

  const totalMaterials = songsCount + gamesCount + textsCount;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <DashboardHeader totalMaterials={totalMaterials} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-9 order-first">
            <DailyVerse />

            <MaterialStats
              gamesCount={gamesCount}
              textsCount={textsCount}
              songsCount={songsCount}
            />

            <RecentMaterials recentMaterials={recentMaterials} />
          </div>

          {/* Sidebar - Moved to bottom on mobile */}
          <div className="lg:col-span-3 order-last">
            {/* <DailyVerse /> */}

            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  );
}
