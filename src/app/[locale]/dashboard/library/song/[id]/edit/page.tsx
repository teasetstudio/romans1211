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
      organization: { userId: session.user.id },
    },
    include: { organization: true, tags: true },
  })

  if (!song) notFound();

  return (
    <div>
      <EditForm material={{ ...song, type: 'song' }} />
    </div>
  );
}
