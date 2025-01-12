import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import EditForm from '../../../components/EditForm';
import { AsyncParams } from '@/types/Params';

export default async function EditGamePage({ params }: AsyncParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const game = await prisma.game.findFirst({
    where: {
      id,
      organization: { userId: session.user.id },
    },
    include: { organization: true, tags: true },
  })

  if (!game) notFound();

  return (
    <div>
      <EditForm material={{ ...game, type: 'game' }} />
    </div>
  );
}
