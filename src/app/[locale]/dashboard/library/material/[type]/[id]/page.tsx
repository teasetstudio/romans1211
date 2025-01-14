import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { IdAndTypeParams } from '@/types/Params';
import MaterialDashboardHeader from '../../../components/MaterialDashboardHeader';
import ContentTitle from '../../../components/ContentTitle';
import MaterialDashboardFooter from '../../../components/MaterialDashboardFooter';
import MaterialDashboardTranslations from '../../../components/MaterialDashboardTranslations';
import { TMaterialsIncluded } from '@/types/Materials';

import '@/styles/tiptap-components.css';
import { materialService } from '@/lib/MaterialServiceForSSR';
import { isValidMaterialType } from '@/utils';

type Included = Required<TMaterialsIncluded>

export default async function MaterialPage({ params }: IdAndTypeParams) {
  const { id, type } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  if (!isValidMaterialType(type)) notFound();

  const material = await materialService.findByTypeAndIdAndUserId<Included>(type, id, session.user.id, {
    organization: true, 
    tags: true, 
    translations: true, 
    original: { include: { translations: true } }
  });

  if (!material) notFound();

  const contentLabel = type === 'game' ? 'Game Description' : type === 'song' ? 'Lyrics' : null;

  return (
    <div className="h-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <MaterialDashboardHeader
          isOriginal={!material.originalId}
          translationsCount={material.translations?.length || 0}
          materialId={material.id}
          type={type}
        />

        <MaterialDashboardTranslations material={material} type={type} />

        {/* Main content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 pt-8 md:p-8 relative">
          <ContentTitle title={material.title} type={type} />

          <div className="flex flex-wrap gap-2 mb-6">
            {material.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-2 py-1 bg-blue-100 rounded-full text-sm text-blue-800"
              >
                {tag.name}
              </span>
            ))}
          </div>

          <div className="prose prose-lg max-w-none">
            {contentLabel && <h2 className="text-sm font-medium text-gray-300 mb-4">{contentLabel}</h2>}
            <div className="tiptap-wrapper whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: material.content }} />
          </div>

          <MaterialDashboardFooter
            organizationName={material.organization.name}
            createdAt={material.createdAt}
            updatedAt={material.updatedAt}
          />
        </div>
      </div>
    </div>
  );
}
