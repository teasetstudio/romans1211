import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AsyncParams } from '@/types/Params';
import MaterialDashboardHeader from '../../components/MaterialDashboardHeader';
import ContentTitle from '../../components/ContentTitle';
import MaterialDashboardFooter from '../../components/MaterialDashboardFooter';

import '@/styles/tiptap-components.css';

export default async function SongPage({ params }: AsyncParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const song = await prisma.song.findFirst({
    where: {
      id,
      organization: { userId: session.user.id },
    },
    include: { organization: true, tags: true },
  })

  if (!song) notFound();

  return (
    <div className="h-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MaterialDashboardHeader
          materialId={song.id}
          type='song'
        />

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 pt-8 md:p-8 relative">
          <ContentTitle title={song.title} type="song" />

          <div className="flex flex-wrap gap-2 mb-6">
            {song.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-100 rounded-full text-sm text-blue-800"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="prose prose-lg max-w-none">
            <h2 className="text-xl font-medium text-gray-700 mb-4">Lyrics</h2>
            <div className="tiptap-wrapper whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: song.content }} />
          </div>

          <MaterialDashboardFooter
            organizationName={song.organization.name}
            createdAt={song.createdAt}
            updatedAt={song.updatedAt}
          />
        </div>
      </div>
    </div>
  );
}
