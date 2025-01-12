import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AsyncParams } from '@/types/Params';
import MaterialDashboardHeader from '../../components/MaterialDashboardHeader';
import ContentTitle from '../../components/ContentTitle';
import MaterialDashboardFooter from '../../components/MaterialDashboardFooter';

import '@/styles/tiptap-components.css';

export default async function TextPage({ params }: AsyncParams) {
  const { id } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const text = await prisma.text.findFirst({
    where: {
      id,
      organization: { userId: session.user.id },
    },
    include: { organization: true, tags: true },
  })

  if (!text) notFound();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Section */}
        <MaterialDashboardHeader
          materialId={text.id}
          type='text'
        />

        {/* Content */}
        <div className="bg-white rounded-3xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] p-5 pt-8 md:p-8 relative">
          <ContentTitle title={text.title} type="text" />

          <div className="flex flex-wrap gap-2 mb-6">
            {text.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-100 rounded-full text-sm text-blue-800"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="prose prose-lg max-w-none">
            <div className="tiptap-wrapper whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: text.content }} />
          </div>

          <MaterialDashboardFooter
            organizationName={text.organization.name}
            createdAt={text.createdAt}
            updatedAt={text.updatedAt}
          />
        </div>
      </div>
    </div>
  );
}
