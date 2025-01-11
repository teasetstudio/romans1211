import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import EditForm from '../../../EditForm';
import { AsyncParams } from '@/types/Params';

export default async function EditSongPage({ params }: AsyncParams) {
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
    <div className="min-h-screen p-8 pb-20 sm:p-20">
      <div className="max-w-4xl mx-auto">
        <EditForm material={{ ...song, type: 'song' }} />
      </div>
    </div>
  );
}
