import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';

import { AsyncParams } from '@/types/Params';
import MaterialDashboardHeader from '../../MaterialDashboardHeader';
import ContentTitle from '../../ContentTitle';
import MaterialDashboardFooter from '../../MaterialDashboardFooter';

import '@/styles/tiptap-components.css';

export default async function GamePage({ params }: AsyncParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const game = await prisma.game.findFirst({
    where: {
      id,
      organization: { userId: session.user.id },
    },
    include: { organization: true, tags: true },
  });

  if (!game) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <MaterialDashboardHeader
          materialId={game.id}
          type='game'
        />

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 pt-8 md:p-8 relative">
          <ContentTitle title={game.title} type="game" />

          <div className="flex flex-wrap gap-2 mb-6">
            {game.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-100 rounded-full text-sm text-blue-800"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Game Description</h2>
            <div className="tiptap-wrapper whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: game.content }} />
          </div>

          <MaterialDashboardFooter
            organizationName={game.organization.name}
            createdAt={game.createdAt}
            updatedAt={game.updatedAt}
          />
        </div>
      </div>
    </div>
  );
}
