import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AsyncParams } from '@/types/Params';
import MaterialActions from '../../MaterialActions';
import MaterialTypeBadge from '@/components/badges/MaterialTypeBadge';

export default async function SongPage({ params }: AsyncParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const song = await prisma.song.findFirst({
    where: {
      id,
      organization: {
        userId: session.user.id,
      },
    },
    include: { organization: true, tags: true },
  })

  if (!song) notFound();

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Link
            href="/dashboard/library"
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"
          >
            ← Back to Library
          </Link>
          <MaterialActions
            materialId={song.id}
            organizationName={song.organization.name}
            type='song'
          />
        </div>

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">{song.title}</h1>
            <MaterialTypeBadge type="song" />
          </div>

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
            <div className="whitespace-pre-wrap font-mono text-gray-800" dangerouslySetInnerHTML={{ __html: song.content }} />
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-500">
              <div>Organization: {song.organization.name}</div>
              <div className="flex gap-4">
                <div>
                  Created: {new Date(song.createdAt).toLocaleDateString()}
                </div>
                <div>
                  Last updated: {new Date(song.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
