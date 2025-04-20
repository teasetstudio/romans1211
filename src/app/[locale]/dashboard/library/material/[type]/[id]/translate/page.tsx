import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound } from 'next/navigation';
import { IdAndTypeParams } from '@/types/Params';
import { isValidMaterialType } from '@/utils';
import { TMaterialsIncludedOrganization, TMaterialsIncludedTags } from '@/types/Materials';
import { materialService } from '@/lib/MaterialServiceForSSR';
import CreateTranslationForm from '../../../../components/CreateTranslationForm';
import { Link } from '@/i18n/routing';
import { getDashboardMaterialUrl } from '@/utils/urls';
import Expandable from '@/components/widgets/ui/Expandable';

type Included = Required<TMaterialsIncludedTags & TMaterialsIncludedOrganization>;

export default async function MaterialTranslatePage({ params }: IdAndTypeParams) {
  const { id, type } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  if (!isValidMaterialType(type)) notFound();

  // Dynamic model selection based on type
  const material = await materialService.findByTypeAndIdAndUserId<Included>(type, id, session.user.id, {
    tags: true, 
  });

  if (!material) notFound()

    // If this is already a translation, redirect to the original
  if (material.originalId) {
    return <div className="container mx-auto p-6">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              This is already a translation. Please go to the{' '}
              <Link href={getDashboardMaterialUrl({ type, id: material.originalId })} className="font-medium underline text-yellow-700 hover:text-yellow-600">
                original material
              </Link>{' '}
              to create new translations.
            </p>
          </div>
        </div>
      </div>
    </div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto">
        <Expandable 
          title={
            <div className='flex items-center gap-3'>
              <h2 className="text-2xl font-bold text-secondary">{material.title}</h2>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-primary text-gray4 rounded-md text-sm font-medium">
                  Original Translation: {material.language.toUpperCase()}
                </span>
              </div>
            </div>
          }
          className="mb-8 outline-none border border-gray2 rounded-2xl"
          defaultExpanded={false}
        >
          <div className="space-y-4">
            <div>
              <h6 className="font-thin text-gray-400 mb-2">Content:</h6>
              <div className="tiptap-wrapper rounded-xl" dangerouslySetInnerHTML={{ __html: material.content }} />
            </div>
            {material.tags && material.tags.length > 0 && (
              <div>
                <h6 className="font-medium text-gray-700 mb-2">Tags:</h6>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map(tag => (
                    <span key={tag.id} className="px-3 py-1 bg-gray5 text-gray1 rounded-full text-sm">
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Expandable>

        <CreateTranslationForm material={material} type={type} />
      </div>
    </div>
  );
}
