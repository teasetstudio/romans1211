import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import EditForm from '../../../EditForm';
import { AsyncParams } from '@/types/Params';

export default async function EditTextPage({ params }: AsyncParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const text = await prisma.text.findFirst({
    where: {
      id,
      organization: { userId: session.user.id },
    },
    include: { organization: true, tags: true },
  });

  if (!text) notFound();

  return (
    <div>
      <EditForm material={{ ...text, type: 'text' }} />
    </div>
  );
}
